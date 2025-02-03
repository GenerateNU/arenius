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

type Payload struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type userSignupResponse struct {
	ID uuid.UUID `json:"id"`
}

type signupResponse struct {
	AccessToken string             `json:"access_token"`
	User        userSignupResponse `json:"user"`
}

func SupabaseSignup(cfg *config.Supabase, email string, password string) (signupResponse, error) {
	supabaseURL := cfg.URL
	apiKey := cfg.Key

	// Prepare the request payload
	payload := Payload{
		Email:    email,
		Password: password,
	}
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return signupResponse{}, err
	}

	// Create the HTTP POST request
	req, err := http.NewRequest("POST", fmt.Sprintf("%s/auth/v1/signup", supabaseURL), bytes.NewBuffer(payloadBytes))
	if err != nil {
		return signupResponse{}, errs.BadRequest(fmt.Sprintf("failed to create request: %v", err))
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("apikey", apiKey)
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", apiKey))

	// Execute the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return signupResponse{}, errs.BadRequest(fmt.Sprintf("failed to execute request: %v, %s", err, supabaseURL))
	}
	defer resp.Body.Close()

	// Read the response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return signupResponse{}, errs.BadRequest("failed to read response body")
	}

	// Check if the response was successful
	if resp.StatusCode != http.StatusOK {
		return signupResponse{}, errs.BadRequest(fmt.Sprintf("failed to login %d, %s", resp.StatusCode, body))
	}

	// Parse the response
	var response signupResponse
	if err := json.Unmarshal(body, &response); err != nil {
		return signupResponse{}, errs.BadRequest("failed to parse response")
	}

	// Return the access token
	return response, nil
}
