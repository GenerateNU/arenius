package lineItem

import (
	"arenius/internal/errs"
	"arenius/internal/models"
	"log"

	"github.com/gofiber/fiber/v2"
)

func (h *Handler) BatchUpdateLineItems(c *fiber.Ctx) error {
	var req models.UpdateLineItemsRequest
	if err := c.BodyParser(&req); err != nil {
		return errs.BadRequest("Invalid request payload: " + err.Error())
	}

	if len(req.LineItemIDs) == 0 {
		return c.JSON(fiber.Map{"message": "No line items to update"})
	}

	if req.Scope != nil && (*req.Scope < 0 || *req.Scope > 3) {
		return c.JSON(fiber.Map{"message": "Scope must be 0, 1, 2, or 3"})
	}

	// Call the new wrapper function
	err := h.ReconcileAndEstimate(c, req.LineItemIDs, req.Scope, req.EmissionsFactorID, nil)
	if err != nil {
		log.Println("Error reconciling and estimating:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to reconcile line items"})
	}

	return c.JSON(fiber.Map{"message": "Line items updated and estimated successfully"})
}
