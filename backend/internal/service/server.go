package service

import (
	"arenius/internal/config"
	"arenius/internal/controllers"
	storage "arenius/internal/storage/postgres"

	go_json "github.com/goccy/go-json"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/jackc/pgx/v5/pgxpool"
)

type App struct {
	Server *fiber.App
	Repo   *storage.Repository
}

// Initialize the App union type containing a fiber app and a repository.
func InitApp(config config.Config) *App {
	repo := storage.NewRepository(config.DB)
	app := SetupApp(config, repo.DB)

	return &App{
		Server: app,
		Repo:   repo,
	}
}

// Setup the fiber app with the specified configuration and database.
func SetupApp(config config.Config, dbPool *pgxpool.Pool) *fiber.App {
	app := fiber.New(fiber.Config{
		JSONEncoder: go_json.Marshal,
		JSONDecoder: go_json.Unmarshal,
	})

	// Use logging middleware
	app.Use(logger.New())
	
	// Use CORS middleware to configure CORS and handle preflight/OPTIONS requests.
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*", 						// Allow any source domain to access API
		AllowMethods: "GET,POST,PUT,DELETE",    // Using these methods.
	}))

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.SendStatus(http.StatusOK)
	})

	return app
}