package auth

import (
	"arenius/internal/config"
	"arenius/internal/storage"

	"github.com/gofiber/fiber/v2/middleware/session"
)

type Handler struct {
	config         config.Supabase
	sess           *session.Store
	userRepository storage.UserRepository
}

type Credentials struct {
	Email     string  `json:"email"`
	Password  string  `json:"password"`
	FirstName *string `json:"first_name"`
	LastName  *string `json:"last_name"`
}

func NewHandler(config config.Supabase, store *session.Store, userRepository storage.UserRepository) *Handler {
	return &Handler{
		config,
		store,
		userRepository,
	}
}
