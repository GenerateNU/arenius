package lineItem

import (
	"arenius/internal/errs"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

func (h *Handler) Checkpoint(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return errs.BadRequest("Invalid company ID")
	}

	err = h.lineItemRepository.Checkpoint(c.Context(), id)
	if err != nil {
		log.Println("Error reconciling and estimating:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to reconcile line items"})
	}

	return c.JSON(fiber.Map{"message": "Checkpoint done successfully"})
}
