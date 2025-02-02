package auth

import (
	"arenius/internal/config"
	"arenius/internal/errs"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/google/uuid"
)

type userResponse struct {
	ID uuid.UUID `json:"id"`
}

type SignInResponse struct {
	AccessToken  string       `json:"access_token"`
	TokenType    string       `json:"token_type"`
	ExpiresIn    int          `json:"expires_in"`
	RefreshToken string       `json:"refresh_token"`
	User         userResponse `json:"user"`
	Error        interface{}  `json:"error"`
}

func SupabaseLogin(cfg *config.Supabase, email string, password string) (SignInResponse, error) {
	supabaseURL := cfg.URL
	apiKey := cfg.Key

	// Prepare the request payload
	payload := map[string]string{
		"email":    email,
		"password": password,
	}
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return SignInResponse{}, err
	}

	// Create the HTTP POST request
	req, err := http.NewRequest("POST", fmt.Sprintf("%s/auth/v1/token?grant_type=password", supabaseURL), bytes.NewBuffer(payloadBytes))
	if err != nil {
		return SignInResponse{}, err
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("apikey", apiKey)

	// Execute the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return SignInResponse{}, errs.BadRequest("failed to execute request")
	}
	defer resp.Body.Close()

	// Read the response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return SignInResponse{}, errs.BadRequest("failed to read response body")
	}

	// Check if the response was successful
	if resp.StatusCode != http.StatusOK {
		fmt.Printf("failed to login %d, %s", resp.StatusCode, body)
		return SignInResponse{}, errs.BadRequest(fmt.Sprintf("failed to login %d, %s", resp.StatusCode, body))
	}

	// Parse the response JSON
	var signInResponse SignInResponse
	err = json.Unmarshal(body, &signInResponse)
	if err != nil {
		return SignInResponse{}, errs.BadRequest("failed to parse response body")
	}

	// Make sure response does not contain an error
	if signInResponse.Error != nil {
		return SignInResponse{}, errs.BadRequest(fmt.Sprintf("sign in response error %v", signInResponse.Error))
	}

	// Return the access token
	return signInResponse, nil
}
