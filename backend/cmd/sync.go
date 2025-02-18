// package main

// import (
// 	"fmt"
// 	"log"
// 	"net/http"

// 	"github.com/robfig/cron/v3"
// )

// // Function to start the cron job
// func startCronJobs(apiURL string) {
// 	c := cron.New()

// 	// Schedule the job to run at midnight every day
// 	c.AddFunc("@daily", func() {
// 		err := callSyncTransactionsEndpoint(apiURL)
// 		if err != nil {
// 			log.Println("Error calling sync transactions endpoint:", err)
// 		} else {
// 			log.Println("Sync transactions triggered successfully")
// 		}
// 	})

// 	c.Start()
// }

// func callSyncTransactionsEndpoint(apiURL string) error {
// 	resp, err := http.Post(apiURL+"/sync-transactions", "application/json", nil)
// 	if err != nil {
// 		return fmt.Errorf("error making request: %w", err)
// 	}
// 	defer resp.Body.Close()

// 	if resp.StatusCode >= 400 {
// 		return fmt.Errorf("failed with status code %d", resp.StatusCode)
// 	}

// 	return nil
// }
