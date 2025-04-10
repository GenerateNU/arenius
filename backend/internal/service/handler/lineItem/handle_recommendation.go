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

	fmt.Println("ID:", id)

	accept := c.Query("accept") == "true"

	lineItem, err := h.lineItemRepository.HandleRecommendation(c.Context(), id, accept)
	if err != nil {
		fmt.Println("Error reconciling:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to reconcile line item"})
	}

	// hit climate API to reconcile and estimate
	if lineItem.Scope != nil && lineItem.EmissionFactorId != nil && *lineItem.EmissionFactorId != "" {
		lineItemUUID, err := uuid.Parse(lineItem.ID)
		if err != nil {
			fmt.Println("Error parsing line item ID:", err)
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid line item ID"})
		}
		err = h.ReconcileAndEstimate(c, []uuid.UUID{lineItemUUID}, lineItem.Scope, lineItem.EmissionFactorId, &lineItem.ContactID)
		if err != nil {
			fmt.Println("Error reconciling and estimating:", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to reconcile line item"})
		}
	}

	return c.Status(fiber.StatusOK).JSON(lineItem)
}
