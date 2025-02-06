package lineItem 

import "arenius/internal/storage"

type Handler struct {
	lineItemRepository storage.LineItemRepository
}

func NewHandler(lineItemRepository storage.LineItemRepository) *Handler {
	return &Handler{
		lineItemRepository,
	}
}
