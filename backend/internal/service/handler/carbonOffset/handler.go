package carbonOffset

import "arenius/internal/storage"

type Handler struct {
	OffsetRepository storage.OffsetRepository
}

func NewHandler(OffsetRepository storage.OffsetRepository) *Handler {
	return &Handler{
		OffsetRepository,
	}
}
