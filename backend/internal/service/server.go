package service

import (
	"arenius/internal/config"
	"arenius/internal/errs"
	"arenius/internal/service/climatiq"
	"arenius/internal/service/ctxt"
	"arenius/internal/service/handler/carbon"
	"arenius/internal/service/handler/transaction"
	"arenius/internal/service/handler/xero"
	"arenius/internal/storage"
	"arenius/internal/storage/postgres"
	"fmt"

	"context"
	"net/http"

	go_json "github.com/goccy/go-json"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/compress"
	"github.com/gofiber/fiber/v2/middleware/cors"
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
	xeroAuthHandler := xero.NewHandler(sess)
	app.Route("/auth", func(r fiber.Router) {
		r.Get("/xero", xeroAuthHandler.RedirectToAuthorisationEndpoint)
	})

	//app.Use("/xero", middleware.XeroAuth)

	app.Get("/callback", xeroAuthHandler.Callback)

	transactionHandler := transaction.NewHandler(repo.Transaction)
	app.Route("/transaction", func(r fiber.Router) {
		r.Post("/", transactionHandler.CreateTransaction)
	})

	// Example route that uses the climatiq client
	carbonHandler := carbon.NewHandler()
	app.Get("/climatiq", carbonHandler.SearchEmissionFactors)

	app.Get("/bank-transactions", func(c *fiber.Ctx) error {
		transactions, err := xeroAuthHandler.GetBankTransactions(c)
		if err != nil {
			return c.Status(500).SendString(fmt.Sprintf("Error fetching bank transactions: %v", err))
		}
		return c.JSON(transactions)
	})

	return app
}
