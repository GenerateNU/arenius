package auth

import (
	"arenius/internal/config"
	"fmt"
	"io"
	"net/http"
)

func SupabaseRevokeSession(cfg *config.Supabase, accessToken string) error {
	supabaseURL := cfg.URL
	apiKey := cfg.Key

	// Create the HTTP POST request
	req, err := http.NewRequest("POST", fmt.Sprintf("%s/auth/v1/logout", supabaseURL), nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %v", err)
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("apikey", apiKey)
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))

	// Execute the request
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to execute request: %v", err)
	}
	defer resp.Body.Close()

	// Read the response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("failed to read response body: %v", err)
	}

	// Check if the response was successful (200 OK or 204 No Content are both success responses)
	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusNoContent {
		return fmt.Errorf("failed to revoke session: %d, %s", resp.StatusCode, string(body))
	}

	fmt.Println("Session revoked successfully with status:", resp.StatusCode)
	return nil
}
