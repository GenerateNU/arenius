package service

import (
	"arenius/internal/config"
	"arenius/internal/errs"
	"arenius/internal/service/climatiq"
	"arenius/internal/service/ctxt"
	"arenius/internal/service/handler/auth"
	"arenius/internal/service/handler/carbon"
	"arenius/internal/service/handler/carbonOffset"
	"arenius/internal/service/handler/contact"
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
		AllowOrigins:     "http://localhost:3000, http://localhost:8080, https://arenius.onrender.com", // Allow any source domain to access API
		AllowMethods:     "GET,POST,PUT,PATCH,DELETE",                                                  // Using these methods.
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowCredentials: true, // Allow cookies
	}))

	// Middleware to set the climatiq client in the context
	app.Use(func(c *fiber.Ctx) error {
		ctxt.SetClimatiqClient(c, climatiqClient)
		return c.Next()
	})

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.SendStatus(http.StatusOK)
	})

	xeroAuthHandler := xero.NewHandler(repo.LineItem, repo.Company, repo.Contact, repo.User)
	app.Route("/auth", func(r fiber.Router) {
		r.Get("/xero", xeroAuthHandler.RedirectToAuthorisationEndpoint)
	})

	SupabaseAuthHandler := auth.NewHandler(config.Supabase, repo.User)

	app.Route("/auth", func(router fiber.Router) {
		router.Post("/signup", SupabaseAuthHandler.SignUp)
		router.Post("/login", SupabaseAuthHandler.Login)
	})

	app.Use(xeroAuthHandler.XeroAuthMiddleware)

	app.Get("/callback", xeroAuthHandler.Callback)

	lineItemHandler := lineItem.NewHandler(repo.LineItem)
	app.Route("/line-item", func(r fiber.Router) {
		r.Get("/", lineItemHandler.GetLineItems)
		r.Patch("/batch", lineItemHandler.BatchUpdateLineItems)
		r.Patch("/:id", lineItemHandler.ReconcileLineItem)
		r.Post("/", lineItemHandler.PostLineItem)
	})

	contactHandler := contact.NewHandler(repo.Contact)
	app.Route("/contact", func(r fiber.Router) {
		r.Get("/:companyId", contactHandler.GetContacts)
		r.Post("", contactHandler.PostContact)
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

	app.Post("/sync-transactions", xeroAuthHandler.SyncTransactions)

	app.Get("/secret", supabase_auth.Middleware(&config.Supabase), func(c *fiber.Ctx) error {
		return c.SendStatus(http.StatusOK)
	})

	offsetHandler := carbonOffset.NewHandler(repo.Offset)

	app.Route("/carbon-offset", func(router fiber.Router) {
		router.Post("/create", func(c *fiber.Ctx) error {
			return offsetHandler.PostCarbonOffset(c)
		})
	})

	// Apply Middleware to Protected Routes
	app.Use(supabase_auth.Middleware(&config.Supabase))

	// // Apply Middleware to Protected Routes
	// app.Use(supabase_auth.Middleware(&config.Supabase))

	// // Protected route example
	// app.Get("/protected", func(c *fiber.Ctx) error {
	// 	return c.JSON(fiber.Map{"message": "Access granted!"})
	// })

	return app
}
