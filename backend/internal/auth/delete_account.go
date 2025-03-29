package auth

import (
	"arenius/internal/config"
	"arenius/internal/errs"
	"fmt"
	"io"
	"net/http"
)

// SupabaseDeleteAccount deletes a user's account by making a request to the Supabase Auth API
func SupabaseDeleteAccount(cfg *config.Supabase, accessToken string) error {
	supabaseURL := cfg.URL
	apiKey := cfg.Key

	// Create the HTTP request to delete the user
	req, err := http.NewRequest("DELETE", fmt.Sprintf("%s/auth/v1/user", supabaseURL), nil)
	if err != nil {
		return errs.BadRequest(fmt.Sprintf("Failed to create request: %v", err))
	}

	// Set the Authorization header with the access token
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))
	req.Header.Set("apikey", apiKey)

	// Execute the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return errs.BadRequest(fmt.Sprintf("Failed to execute request: %v", err))
	}
	defer resp.Body.Close()

	// Check the response
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return errs.BadRequest("Failed to read response body")
	}

	if resp.StatusCode != http.StatusOK {
		return errs.BadRequest(fmt.Sprintf("Failed to delete account, status: %d, response: %s", resp.StatusCode, body))
	}

	// Successfully deleted the account
	return nil
}
