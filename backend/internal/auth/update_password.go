package auth

import (
	"arenius/internal/config"
	"arenius/internal/errs"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

// SupabaseUpdatePassword updates the user's password using the reset token
func SupabaseUpdatePassword(cfg *config.Supabase, token string, newPassword string) error {
	supabaseURL := cfg.URL
	apiKey := cfg.Key

	// Prepare the request payload
	payload := struct {
		Password string `json:"password"`
	}{
		Password: newPassword,
	}

	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	// Create the HTTP PUT request
	req, err := http.NewRequest("PUT", fmt.Sprintf("%s/auth/v1/user", supabaseURL), bytes.NewBuffer(payloadBytes))
	if err != nil {
		return errs.BadRequest(fmt.Sprintf("failed to create request: %v", err))
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("apikey", apiKey)
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))

	// Execute the request
	resp, err := Client.Do(req)
	if err != nil {
		return errs.BadRequest(fmt.Sprintf("failed to execute request: %v", err))
	}
	defer resp.Body.Close()

	// Read the response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return errs.BadRequest("failed to read response body")
	}

	// Check if the response was successful
	if resp.StatusCode != http.StatusOK {
		return errs.BadRequest(fmt.Sprintf("failed to update password %d, %s", resp.StatusCode, body))
	}

	return nil
}
