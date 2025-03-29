package emissionsFactor

import (
	"arenius/internal/errs"
	"fmt"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

func (h *Handler) PostFavoriteEmission(c *fiber.Ctx) error {
	companyId := c.Query("company_id")
	emissionFactorId := c.Query("emission_factor_id")

	var setFavorite bool

	if val := c.Query("set_favorite"); val != "" {
		parsed, err := strconv.ParseBool(val)
		if err == nil {
			setFavorite = parsed
		} else {
			return errs.BadRequest(fmt.Sprintf("Invalid set_favorite value: ", err))
		}
	}

	if companyId == "" || emissionFactorId == "" {
		return errs.BadRequest("company_id and emission_factor_id required")
	}

	err := h.emissionsFactorRepository.PostFavoriteEmissionFactors(c.Context(), companyId, emissionFactorId, setFavorite)
	if err != nil {
		return err
	}
	return c.Status(fiber.StatusOK).JSON(nil)
}
