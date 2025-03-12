package contact

import (
	"github.com/gofiber/fiber/v2"
)

type ContactEmissionsResponse struct {
	ContactName string  `json:"contact"`
	Carbon      float64 `json:"carbon"`
}

func (h *Handler) GetContactEmissions(c *fiber.Ctx) error {
	contactId := c.Params("contactId")

	contact, carbon, err := h.contactRepository.GetContactEmissions(c.Context(), contactId)
	if err != nil {
		return err
	}

	response := ContactEmissionsResponse{
		ContactName: contact,
		Carbon:      carbon,
	}

	return c.Status(fiber.StatusOK).JSON(response)
}
