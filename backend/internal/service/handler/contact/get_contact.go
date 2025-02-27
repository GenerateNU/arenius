package contact

import (
	"github.com/gofiber/fiber/v2"
)

func (h *Handler) GetContact(c *fiber.Ctx) error {
	contactId := c.Params("contactId")

	contact, err := h.contactRepository.GetContact(c.Context(), contactId)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(contact)
}
