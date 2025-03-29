package emissionsFactor

import (
	"arenius/internal/errs"
	"fmt"

	"github.com/gofiber/fiber/v2"
)

func (h *Handler) PostFavoriteEmission(c *fiber.Ctx) error {
	type FavoriteRequest struct {
		CompanyID         string `json:"company_id"`
		EmissionsFactorID string `json:"emissions_factor_id"`
		SetFavorite       bool   `json:"set_favorite"`
	}

	var req FavoriteRequest
	if err := c.BodyParser(&req); err != nil {
		return errs.BadRequest(fmt.Sprintf("Invalid request body: %s", err))
	}

	if req.EmissionsFactorID == "" {
		return errs.BadRequest("emissions_factor_id required")
	}
	if req.CompanyID == "" {
		return errs.BadRequest("company_id required")
	}

	err := h.emissionsFactorRepository.PostFavoriteEmissionFactors(
		c.Context(),
		req.CompanyID,
		req.EmissionsFactorID,
		req.SetFavorite,
	)
	if err != nil {
		return err
	}
	return c.Status(fiber.StatusOK).JSON(nil)
}
