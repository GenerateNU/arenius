package contact

import (
	"arenius/internal/errs"
	"arenius/internal/models"
	"fmt"

	"github.com/gofiber/fiber/v2"
)

func (h *Handler) UpdateContact(c *fiber.Ctx) error {
	contactId := c.Params("contactId")

	var req models.UpdateContactRequest
	if err := c.BodyParser(&req); err != nil {
		return errs.BadRequest(fmt.Sprintf("error parsing request body: %v", err))
	}

	contact, err := h.contactRepository.UpdateContact(c.Context(), contactId, req)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(contact)
}
