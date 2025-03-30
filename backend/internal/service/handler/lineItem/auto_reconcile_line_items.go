package lineItem

import (
	"arenius/internal/errs"
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

func (h *Handler) AutoReconcileLineItem(c *fiber.Ctx) error {
	companyId, err := uuid.Parse(c.Query("company_id"))
	if err != nil {
		return errs.BadRequest("Invalid company ID")
	}

	reconciledLineItems, err := h.lineItemRepository.AutoReconcileLineItems(c.Context(), companyId)
	if err != nil {
		fmt.Println("Error reconciling and estimating:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to reconcile line item"})
	}

	return c.Status(fiber.StatusOK).JSON(reconciledLineItems)
}
