package service

import (
	"arenius/internal/config"
	"arenius/internal/errs"
	"arenius/internal/service/handler/transaction"
	"arenius/internal/service/handler/lineitem"
	"arenius/internal/storage"
	"arenius/internal/storage/postgres"

	"context"
	"net/http"

	go_json "github.com/goccy/go-json"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/compress"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

type App struct {
	Server *fiber.App
	Repo   *storage.Repository
}

// Initialize the App union type containing a fiber app and a repository.
func InitApp(config config.Config) *App {
	ctx := context.Background()
	repo := postgres.NewRepository(ctx, config.DB)
	app := SetupApp(config, repo)

	return &App{
		Server: app,
		Repo:   repo,
	}
}

// Setup the fiber app with the specified configuration and database.
func SetupApp(config config.Config, repo *storage.Repository) *fiber.App {
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

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.SendStatus(http.StatusOK)
	})

	transactionHandler := transaction.NewHandler(repo.Transaction)
	app.Route("/transaction", func(r fiber.Router) {
		r.Post("/", transactionHandler.CreateTransaction)
	})

	lineItemHandler := lineitem.NewHandler(repo.LineItem)
	app.Route("/lineitem", func(r fiber.Router) {
		r.Get("/", lineItemHandler.GetLineItems)
	})

	return app
}
