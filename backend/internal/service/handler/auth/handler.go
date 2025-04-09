package auth

import (
	"arenius/internal/config"
	"arenius/internal/storage"
)

type Handler struct {
	config         config.Supabase
	userRepository storage.UserRepository
}

type Credentials struct {
	Email      string  `json:"email"`
	Password   string  `json:"password"`
	FirstName  *string `json:"first_name"`
	LastName   *string `json:"last_name"`
	RememberMe bool
}

func NewHandler(config config.Supabase, userRepository storage.UserRepository) *Handler {
	return &Handler{
		config,
		userRepository,
	}
}
