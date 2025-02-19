package main

import (
	"arenius/internal/config"
	"arenius/internal/service"
	"context"
	"fmt"
	"log"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/joho/godotenv"
	"github.com/robfig/cron/v3"
	"github.com/sethvargo/go-envconfig"
)

func main() {
	err := godotenv.Load("../.env")
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

	port := config.Application.Port
	// Listen for connections with a goroutine.
	go func() {
		if err := app.Server.Listen(":" + port); err != nil {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	go startCronJobs("http://localhost:" + port) // Change this URL if your API is hosted elsewhere

	//select {}

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

// Function to start the cron job
func startCronJobs(apiURL string) {
	c := cron.New()

	// Schedule the job to run at midnight every day
	c.AddFunc("@daily", func() {
		err := callSyncTransactionsEndpoint(apiURL)
		if err != nil {
			log.Println("Error calling sync transactions endpoint:", err)
		} else {
			log.Println("Sync transactions triggered successfully")
		}
	})

	c.Start()
}

func callSyncTransactionsEndpoint(apiURL string) error {
	resp, err := http.Post(apiURL+"/sync-transactions", "application/json", nil)
	if err != nil {
		return fmt.Errorf("error making request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("failed with status code %d", resp.StatusCode)
	}

	return nil
}
