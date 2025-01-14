package service

import (
	"arenius/internal/config"
	"arenius/internal/errs"
	"arenius/internal/service/climatiq"
	"arenius/internal/service/ctxt"
	"arenius/internal/service/handler/transaction"
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

	transactionHandler := transaction.NewHandler(repo.Transaction)
	app.Route("/transaction", func(r fiber.Router) {
		r.Post("/", transactionHandler.CreateTransaction)
	})

	// Example route that uses the climatiq client
	app.Get("/climatiq", transactionHandler.Search)

	return app
}
