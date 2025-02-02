package auth

import (
	"bytes"
	"encoding/json"
	"net/http"
)

type Credentials struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// Helper function to make requests to Supabase Auth API
func (h *Handler) makeSupabaseRequest(method, path string, body interface{}) (*http.Response, error) {
	jsonData, _ := json.Marshal(body)
	req, err := http.NewRequest(method, h.config.URL+"/auth/v1"+path, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+h.config.Key) // Use the anon key for client-side auth
	req.Header.Set("apikey", h.config.Key)

	client := &http.Client{}
	return client.Do(req)
}
