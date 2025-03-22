package user 

import "arenius/internal/storage"

type Handler struct {
	UserRepository storage.UserRepository
}

func NewHandler(userRepository storage.UserRepository) *Handler {
	return &Handler{
		userRepository,
	}
}
