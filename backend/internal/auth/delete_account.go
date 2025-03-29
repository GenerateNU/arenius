package auth

import (
	"arenius/internal/config"
	"arenius/internal/errs"
	"fmt"
	"io"
	"net/http"
)

func SupabaseDeleteAccount(cfg *config.Supabase, userID string) error {
	supabaseURL := cfg.URL
	serviceroleKey := cfg.ServiceRoleKey

	// Create the HTTP request to delete the user via admin API
	req, err := http.NewRequest("DELETE", fmt.Sprintf("%s/auth/v1/admin/users/%s", supabaseURL, userID), nil)
	if err != nil {
		return errs.BadRequest(fmt.Sprintf("Failed to create request: %v", err))
	}

	// CRITICAL: Exact header names must match what Supabase expects
	req.Header.Set("Content-Type", "application/json")

	// The API key header must be exactly "Authorization" with "Bearer " prefix
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", serviceroleKey))

	// The apikey header must be lowercase "apikey"
	req.Header.Set("apikey", serviceroleKey)

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

	// Supabase might return 200 OK or 204 No Content for successful operations
	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusNoContent {
		return errs.BadRequest(fmt.Sprintf("Failed to delete account, status: %d, response: %s", resp.StatusCode, string(body)))
	}

	return nil
}
