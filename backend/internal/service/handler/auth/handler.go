package auth

import (
	"arenius/internal/config"

	"github.com/gofiber/fiber/v2/middleware/session"
)

type Handler struct {
	config config.Supabase
	sess   *session.Store
}

func NewHandler(config config.Supabase, store *session.Store) *Handler {
	return &Handler{
		config,
		store,
	}
}

// type Handler struct {
// 	supabaseURL string
// 	supabaseKey string
// }

// func NewHandler() *Handler {

// 	supabaseURL := os.Getenv("SUPABASE_URL")
// 	supabaseKey := os.Getenv("SUPABASE_ANON_KEY")

// 	if supabaseURL == "" || supabaseKey == "" {
// 		log.Fatal("SUPABASE_URL and SUPABASE_ANON_KEY environment variables must be set")
// 	}

// 	return &Handler{supabaseURL: supabaseURL, supabaseKey: supabaseKey}
// }
