package contact 

import "arenius/internal/storage"

type Handler struct {
	contactRepository storage.ContactRepository
}

func NewHandler(contactRepository storage.ContactRepository) *Handler {
	return &Handler{
		contactRepository,
	}
}
