package auth

import (
	"arenius/internal/config"
	"arenius/internal/storage"

	"github.com/gofiber/fiber/v2/middleware/session"
)

type Handler struct {
	config   config.Supabase
	sess     *session.Store
	credRepo storage.CredentialsRepository
}

type Credentials struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func NewHandler(config config.Supabase, store *session.Store, credRepo storage.CredentialsRepository) *Handler {
	return &Handler{
		config,
		store,
		credRepo,
	}
}
