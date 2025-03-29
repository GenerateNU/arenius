package emissionsFactor

import (
	"github.com/gofiber/fiber/v2"
)

func (h *Handler) GetEmissionFactors(c *fiber.Ctx) error {
	companyId := c.Query("company_id")
	searchTerm := c.Query("search_term")
	emissionFactors, err := h.emissionsFactorRepository.GetEmissionFactors(c.Context(), companyId, searchTerm)
	if err != nil {
		return err
	}
	return c.Status(fiber.StatusOK).JSON(emissionFactors)

}
