package lineItem

import (
	"arenius/internal/errs"
	"arenius/internal/models"
	"fmt"

	"github.com/gofiber/fiber/v2"
)

func (h *Handler) BatchUpdateLineItemsOffset(c *fiber.Ctx) error {
	var req models.UpdateLineItemsRequest
	if err := c.BodyParser(&req); err != nil {
		return errs.BadRequest("Invalid request payload: " + err.Error())
	}

	if len(req.LineItemIDs) == 0 {
		return c.JSON(fiber.Map{"message": "No Offsets to update"})
	}

	if req.Scope != nil && (*req.Scope != 0) {
		return c.JSON(fiber.Map{"message": "Scope must be 0 for offsets"})
	}

	err := h.lineItemRepository.BatchUpdateLineItems(c.Context(), req.LineItemIDs, req.Scope, req.EmissionsFactorID, req.CO2, req.CO2Unit)
	if err != nil {
		return fmt.Errorf("error updating Offsets: %w", err)
	}

	return c.JSON(fiber.Map{"message": "Offsets updated successfully"})
}
