package lineItem

import (
	"arenius/internal/errs"
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

func (h *Handler) HandleRecommendation(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return errs.BadRequest("Invalid line item ID")
	}

	accept := c.Query("accept") == "true"

	lineItem, err := h.lineItemRepository.HandleRecommendation(c.Context(), id, accept)
	if err != nil {
		fmt.Println("Error reconciling:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to reconcile line item"})
	}

	return c.Status(fiber.StatusOK).JSON(lineItem)
}
