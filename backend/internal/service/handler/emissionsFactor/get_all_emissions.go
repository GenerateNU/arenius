package emissionsFactor

import (
	"github.com/gofiber/fiber/v2"
)

func (h *Handler) GetEmissionFactors(c *fiber.Ctx) error {

	emissionFactors, err := h.emissionsFactorRepository.GetEmissionFactors(c.Context())
	if err != nil {
		return err
	}
	return c.Status(fiber.StatusOK).JSON(emissionFactors)

}
