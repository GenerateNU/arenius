package summary

import "arenius/internal/storage"

type Handler struct {
	summaryRepository storage.SummaryRepository
}

func NewHandler(summaryRepository storage.SummaryRepository) *Handler {
	return &Handler{
		summaryRepository,
	}
}
