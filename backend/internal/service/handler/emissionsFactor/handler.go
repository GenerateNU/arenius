package emissionsFactor

import "arenius/internal/storage"

type Handler struct {
	emissionsFactorRepository storage.EmissionsFactorRepository
}

func NewHandler(emissionsFactorRepository storage.EmissionsFactorRepository) *Handler {
	return &Handler{
		emissionsFactorRepository,
	}
}
