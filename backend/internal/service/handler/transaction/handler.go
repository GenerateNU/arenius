package transaction

import (
	"arenius/internal/storage"
)

type Handler struct {
	transactionRepository storage.TransactionRepository
}

func NewHandler(transactionRepository storage.TransactionRepository) *Handler {
	return &Handler{
		transactionRepository,
	}
}
