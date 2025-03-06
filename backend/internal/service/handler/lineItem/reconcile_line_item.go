package lineItem

import (
	"arenius/internal/errs"
	"arenius/internal/models"
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

func (h *Handler) ReconcileLineItem(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return errs.BadRequest("Invalid line item ID")
	}

	var req models.ReconcileLineItemRequest
	if err := c.BodyParser(&req); err != nil {
		return errs.BadRequest("Invalid request payload: " + err.Error())
	}

	err = h.ReconcileAndEstimate(c, []uuid.UUID{id}, &req.Scope, &req.EmissionsFactor, req.ContactID)
	if err != nil {
		fmt.Println("Error reconciling and estimating:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to reconcile line item"})
	}

	return c.JSON(fiber.Map{"message": "Line item updated and estimated successfully"})
}
