package service

import (
	"arenius/internal/config"
	"arenius/internal/errs"
	"arenius/internal/service/climatiq"
	"arenius/internal/service/ctxt"
	"arenius/internal/service/handler/auth"
	"arenius/internal/service/handler/carbon"
	"arenius/internal/service/handler/emissionsFactor"
	"arenius/internal/service/handler/lineItem"
	"arenius/internal/service/handler/summary"
	"arenius/internal/service/handler/xero"
	"arenius/internal/storage"
	"arenius/internal/storage/postgres"

	"context"
	"net/http"

	supabase_auth "arenius/internal/auth"

	go_json "github.com/goccy/go-json"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/compress"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/favicon"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/gofiber/fiber/v2/middleware/session"
)

type App struct {
	Server *fiber.App
	Repo   *storage.Repository
}

// Initialize the App union type containing a fiber app, a repository, and a climatiq client.
func InitApp(config config.Config) *App {
	ctx := context.Background()
	repo := postgres.NewRepository(ctx, config.DB)

	climatiqClient := climatiq.NewClient()

	app := SetupApp(config, repo, climatiqClient)

	return &App{
		Server: app,
		Repo:   repo,
	}
}

// Setup the fiber app with the specified configuration, database, and climatiq client.
func SetupApp(config config.Config, repo *storage.Repository, climatiqClient *climatiq.Client) *fiber.App {
	app := fiber.New(fiber.Config{
		JSONEncoder:  go_json.Marshal,
		JSONDecoder:  go_json.Unmarshal,
		ErrorHandler: errs.ErrorHandler,
	})

	app.Use(recover.New())
	app.Use(favicon.New())
	app.Use(compress.New(compress.Config{
		Level: compress.LevelBestSpeed,
	}))

	// Use logging middleware
	app.Use(logger.New())

	// Use CORS middleware to configure CORS and handle preflight/OPTIONS requests.
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",                   // Allow any source domain to access API
		AllowMethods: "GET,POST,PUT,DELETE", // Using these methods.
	}))

	// Middleware to set the climatiq client in the context
	app.Use(func(c *fiber.Ctx) error {
		ctxt.SetClimatiqClient(c, climatiqClient)
		return c.Next()
	})

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.SendStatus(http.StatusOK)
	})

	sess := session.New()
	xeroAuthHandler := xero.NewHandler(sess, repo.LineItem, repo.Company)

	app.Route("/auth", func(r fiber.Router) {
		r.Get("/xero", xeroAuthHandler.RedirectToAuthorisationEndpoint)
	})

	app.Route("/credentials", func(router fiber.Router) {
		router.Post("/create", func(c *fiber.Ctx) error {
			return xeroAuthHandler.CreateCredentials(c, repo.Credentials)
		})
	})

	app.Use(xeroAuthHandler.XeroAuthMiddleware)

	app.Route("/credentials", func(router fiber.Router) {
		router.Get("/get", func(c *fiber.Ctx) error {
			return xeroAuthHandler.GetCredentials(c, repo.Credentials)
		})
	})

	SupabaseAuthHandler := auth.NewHandler(config.Supabase, sess)
	app.Route("/auth", func(router fiber.Router) {
		router.Post("/signup", SupabaseAuthHandler.SignUp)
		router.Post("/login", SupabaseAuthHandler.Login)
	})

	app.Get("/callback", xeroAuthHandler.Callback)

	lineItemHandler := lineItem.NewHandler(repo.LineItem)
	app.Route("/line-item", func(r fiber.Router) {
		r.Get("/", lineItemHandler.GetLineItems)
		r.Patch("/:id", lineItemHandler.ReconcileLineItem)
		r.Post("/", lineItemHandler.PostLineItem)
	})

	emissionsFactorHandler := emissionsFactor.NewHandler(repo.EmissionsFactor)
	app.Route("/emissions-factor", func(r fiber.Router) {
		r.Get("/", emissionsFactorHandler.GetEmissionFactors)
		r.Patch("/populate", emissionsFactorHandler.PopulateEmissions)
	})

	// Example route that uses the climatiq client
	carbonHandler := carbon.NewHandler()
	app.Route("/climatiq", func(r fiber.Router) {
		r.Get("/", carbonHandler.SearchEmissionFactors)
		r.Patch("estimate", lineItemHandler.EstimateCarbonEmissions)
	})

	summaryHandler := summary.NewHandler(repo.Summary)
	app.Route("/summary", func(r fiber.Router) {
		r.Get("/gross", summaryHandler.GetGrossSummary)
	})

	app.Get("/bank-transactions", xeroAuthHandler.GetBankTransactions)

	app.Get("/secret", supabase_auth.Middleware(&config.Supabase), func(c *fiber.Ctx) error {
		return c.SendStatus(http.StatusOK)
	})

	// Apply Middleware to Protected Routes
	app.Use(supabase_auth.Middleware(&config.Supabase))

	// Protected route example
	app.Get("/protected", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"message": "Access granted!"})
	})

	return app
}
