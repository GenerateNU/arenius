package auth

import (
	"arenius/internal/config"

	"github.com/gofiber/fiber/v2/middleware/session"
)

type Handler struct {
	config config.Supabase
	sess   *session.Store
}

type Credentials struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func NewHandler(config config.Supabase, store *session.Store) *Handler {
	return &Handler{
		config,
		store,
	}
}
