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
	"arenius/internal/service/handler/user"
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
		AllowOrigins:     "http://localhost:3000,http://localhost:8080,https://sea-lion-app-y4r7v.ondigitalocean.app", // Allow any source domain to access API
		AllowMethods:     "GET,POST,PUT,PATCH,DELETE,OPTIONS",                                                         // Using these methods.
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowCredentials: true, // Allow cookies
		ExposeHeaders:    "Content-Length, X-Request-ID",
	}))

	// Middleware to set the climatiq client in the context
	app.Use(func(c *fiber.Ctx) error {
		ctxt.SetClimatiqClient(c, climatiqClient)
		return c.Next()
	})

	// Define xeroAuthHandler before its usage
	xeroAuthHandler := xero.NewHandler(repo.LineItem, repo.Company, repo.Contact, repo.User)

	app.Post("/sync-transactions", xeroAuthHandler.XeroAuthMiddleware, xeroAuthHandler.SyncTransactions)

	app.Route("/auth", func(r fiber.Router) {
		r.Get("/xero", xeroAuthHandler.RedirectToAuthorisationEndpoint)
	})

	// cannot
	app.Get("/callback", xeroAuthHandler.Callback)

	SupabaseAuthHandler := auth.NewHandler(config.Supabase, repo.User)

	// can
	app.Route("/auth", func(router fiber.Router) {
		router.Post("/signup", SupabaseAuthHandler.SignUp)
		router.Post("/login", SupabaseAuthHandler.Login)
		router.Post("/forgot-password", SupabaseAuthHandler.ForgotPassword)
		router.Post("/reset-password", SupabaseAuthHandler.ResetPassword)
		router.Post("/sign-out", SupabaseAuthHandler.SignOut)
		router.Delete("/delete-account/:id", func(c *fiber.Ctx) error {
			id := c.Params("id")
			return SupabaseAuthHandler.DeleteAccount(c, id)
		})
	})

	// cannot
	offsetHandler := carbonOffset.NewHandler(repo.Offset)
	app.Route("/carbon-offset", func(r fiber.Router) {
		r.Get("/", offsetHandler.GetCarbonOffsets)
		r.Post("/create", offsetHandler.PostCarbonOffset)
		r.Post("/batch", offsetHandler.BatchCreateCarbonOffsets)
	})

	// cannot
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.SendStatus(http.StatusOK)
	})

	// Apply Middleware to Protected Routes
	// app.Use(supabase_auth.Middleware(&config.Supabase))

	// cannot
	lineItemHandler := lineItem.NewHandler(repo.LineItem)
	app.Route("/line-item", func(r fiber.Router) {
		r.Get("/", lineItemHandler.GetLineItems)
		r.Patch("/batch", lineItemHandler.BatchUpdateLineItems)
		r.Patch("/:id", lineItemHandler.ReconcileLineItem)
		r.Patch("/handle-recommendation/:id", lineItemHandler.HandleRecommendation)
		r.Post("/", lineItemHandler.PostLineItem)
		r.Get("/get-recommendations", lineItemHandler.AutoReconcileLineItem)
	})

	// cannot
	contactHandler := contact.NewHandler(repo.Contact)
	app.Route("/contact", func(r fiber.Router) {
		r.Get("/company/:companyId", contactHandler.GetContacts)
		r.Get("/:contactId", contactHandler.GetContact)
		r.Post("", contactHandler.PostContact)
	})

	// cannot
	emissionsFactorHandler := emissionsFactor.NewHandler(repo.EmissionsFactor)
	app.Route("/emissions-factor", func(r fiber.Router) {
		r.Get("/", emissionsFactorHandler.GetEmissionFactors)
		r.Patch("/populate", emissionsFactorHandler.PopulateEmissions)
		r.Post("/favorite", emissionsFactorHandler.PostFavoriteEmission)
	})

	userHandler := user.NewHandler(repo.User)
	app.Route("/user", func(r fiber.Router) {
		r.Get("/:id", userHandler.GetUserProfile)
		r.Patch("/:id", userHandler.UpdateUserProfile)
	})

	// cannot
	// Example route that uses the climatiq client
	carbonHandler := carbon.NewHandler()
	app.Route("/climatiq", func(r fiber.Router) {
		r.Get("/", carbonHandler.SearchEmissionFactors)
	})

	// cannot
	summaryHandler := summary.NewHandler(repo.Summary)
	app.Route("/summary", func(r fiber.Router) {
		r.Get("/gross", summaryHandler.GetGrossSummary)
		r.Get("/net", summaryHandler.GetNetSummary)
		r.Get("/contact/emissions", summaryHandler.GetContactEmissions)
		r.Get("/scopes", summaryHandler.GetScopeBreakdown)
		r.Get("/top-emissions", summaryHandler.GetTopEmissions)
	})

	// cannot
	app.Get("/secret", supabase_auth.Middleware(&config.Supabase), func(c *fiber.Ctx) error {
		return c.SendStatus(http.StatusOK)
	})

	// // Apply Middleware to Protected Routes
	// app.Use(supabase_auth.Middleware(&config.Supabase))

	// // Protected route example
	// app.Get("/protected", func(c *fiber.Ctx) error {
	// 	return c.JSON(fiber.Map{"message": "Access granted!"})
	// })

	return app
}
