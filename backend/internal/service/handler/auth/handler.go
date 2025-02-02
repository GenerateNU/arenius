package auth

import (
	"log"
	"os"
)

type Handler struct {
	supabaseURL string
	supabaseKey string
}

func NewHandler() *Handler {

	supabaseURL := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_ANON_KEY")

	if supabaseURL == "" || supabaseKey == "" {
		log.Fatal("SUPABASE_URL and SUPABASE_ANON_KEY environment variables must be set")
	}

	return &Handler{supabaseURL: supabaseURL, supabaseKey: supabaseKey}
}
