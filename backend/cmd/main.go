package main

import (
	"context"
	"log"
	"github.com/joho/godotenv"
	"github.com/sethvargo/go-envconfig"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file: %v", err)
		return
	}

	var config config.Config
	if err := envconfig.Process(context.Background(), &config); err != nil {
		log.Fatalln("Error processing .env file: ", err)
	}

	app := service.InitApp(config)
	
	// Pushing the closing of the database connection onto a 
	// stack of statements to be executed when this function returns.
	defer app.Repo.Close()
	
	// Listen for connections with a goroutine.
	go func() {
		if err := app.Listen(fmt.Sprintf(":%d", config.Application.Port)); err != nil {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	// Wait for the termination signal:
	<-quit

	// Then shutdown server gracefully.
	slog.Info("Shutting down server")
	if err := app.Server.Shutdown(); err != nil {
		slog.Error("failed to shutdown server", "error", err)
	}

	slog.Info("Server shutdown")
}