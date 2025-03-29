package auth

import (
	"arenius/internal/config"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

func SupabaseRevokeSession(cfg *config.Supabase, accessToken string) error {
	supabaseURL := cfg.URL
	apiKey := cfg.Key

	// Prepare the request payload
	payload := struct {
		AccessToken string `json:"access_token"`
	}{
		AccessToken: accessToken,
	}
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	// Create the HTTP POST request
	req, err := http.NewRequest("POST", fmt.Sprintf("%s/auth/v1/revoke", supabaseURL), bytes.NewBuffer(payloadBytes))
	if err != nil {
		return fmt.Errorf("failed to create request: %v", err)
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("apikey", apiKey)

	// Execute the request
	resp, err := Client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to execute request: %v", err)
	}
	defer resp.Body.Close()

	// Read the response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("failed to read response body: %v", err)
	}

	// Check if the response was successful
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("failed to revoke session: %d, %s", resp.StatusCode, body)
	}

	return nil
}
