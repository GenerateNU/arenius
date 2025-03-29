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

type PasswordResetRequest struct {
	Email string `json:"email"`
}

func SupabaseForgotPassword(cfg *config.Supabase, email string) error {
	supabaseURL := cfg.URL
	apiKey := cfg.Key

	// Prepare the request payload
	payload := PasswordResetRequest{
		Email: email,
	}
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	// Create the HTTP POST request
	req, err := http.NewRequest("POST", fmt.Sprintf("%s/auth/v1/recover", supabaseURL), bytes.NewBuffer(payloadBytes))
	if err != nil {
		return errs.BadRequest(fmt.Sprintf("failed to create request: %v", err))
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("apikey", apiKey)

	// Execute the request
	resp, err := Client.Do(req)
	if err != nil {
		return errs.BadRequest("failed to execute request")
	}
	defer resp.Body.Close()

	// Read the response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return errs.BadRequest("failed to read response body")
	}

	// Check if the response was successful
	if resp.StatusCode != http.StatusOK {
		return errs.BadRequest(fmt.Sprintf("failed to request password reset: %d, %s", resp.StatusCode, body))
	}

	return nil
}
