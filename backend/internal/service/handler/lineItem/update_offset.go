package lineItem

import (
	"arenius/internal/errs"
	"arenius/internal/models"
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

func (h *Handler) UpdateLineItemOffset(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		fmt.Println("Invalid line item ID:", id, err)
		return errs.BadRequest("Invalid line item ID")
	}

	var req models.ReconcileLineItemRequest
	if err := c.BodyParser(&req); err != nil {
		fmt.Println("Error parsing request body:", err)
		return errs.BadRequest("Invalid request payload: " + err.Error())
	}

	result, err := h.lineItemRepository.ReconcileLineItem(c.Context(), id.String(), req.Scope, "", req.ContactID, req.CO2, req.CO2Unit)
	fmt.Println("ReconcileLineItem result:", result)
	if err != nil {
		fmt.Println("Error reconciling line item:", err)
		return err
	}

	return c.JSON(fiber.Map{"message": "Offset updated successfully"})
}
