package lineItem

import (
	"arenius/internal/errs"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type UpdateLineItemsRequest struct {
	LineItemIDs       []uuid.UUID `json:"line_item_ids"`
	Scope             *int        `json:"scope,omitempty"`
	EmissionsFactorID string      `json:"emissions_factor_id,omitempty"`
}

func (h *Handler) BatchUpdateLineItems(c *fiber.Ctx) error {
	var req UpdateLineItemsRequest

	if err := c.BodyParser(&req); err != nil {
		return errs.BadRequest("Invalid request payload: " + err.Error())

	}

	if len(req.LineItemIDs) == 0 {
		log.Println("Error: Empty line_item_ids")
		return c.JSON(fiber.Map{"message": "No line items to update"})
	}

	if req.Scope == nil && req.EmissionsFactorID == "" {
		log.Println("Error: Neither scope nor emissions_factor_id provided")
		return c.JSON(fiber.Map{"message": "No scope or emissions factor ID provided"})
	}

	if req.Scope != nil && (*req.Scope < 1 || *req.Scope > 3) {
		log.Println("Error: Invalid scope value")
		return c.JSON(fiber.Map{"message": "Scope must be 1, 2, or 3"})
	}

	err := h.lineItemRepository.BatchUpdateScopeEmissions(c.Context(), req.LineItemIDs, req.Scope, req.EmissionsFactorID)
	if err != nil {
		log.Println("Database update error:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update line items"})
	}

	return c.JSON(fiber.Map{"message": "Line items updated successfully"})
}
