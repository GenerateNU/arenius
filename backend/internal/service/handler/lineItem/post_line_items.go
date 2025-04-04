package lineItem

import (
	"arenius/internal/errs"
	"arenius/internal/models"
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

func (h *Handler) PostLineItem(c *fiber.Ctx) error {
	var req models.CreateLineItemRequest
	if err := c.BodyParser(&req); err != nil {
		return errs.BadRequest(fmt.Sprintf("error parsing request body: %v", err))
	}
	fmt.Println(req)

	// ensure that all required fields are present
	if req.Description == "" {
		return errs.BadRequest("Description is required")
	}
	if req.TotalAmount == 0 {
		return errs.BadRequest("Non-zero unit amount is required")
	}
	if req.CompanyID == "" {
		return errs.BadRequest("Company ID is required")
	}
	if req.ContactID == "" {
		return errs.BadRequest("Contact ID is required")
	}

	createdItem, err := h.lineItemRepository.CreateLineItem(c.Context(), req)
	if err != nil {
		return err
	}

	parsedID, parseErr := uuid.Parse(createdItem.ID)
	if parseErr != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid UUID format for createdItem.ID"})
	}

	// hit climate API to reconcile and estimate
	if createdItem.Scope != nil && createdItem.EmissionFactorId != nil && *createdItem.EmissionFactorId != "" {
		err = h.ReconcileAndEstimate(c, []uuid.UUID{parsedID}, createdItem.Scope, createdItem.EmissionFactorId, &createdItem.ContactID)
		if err != nil {
			fmt.Println("Error reconciling and estimating:", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to reconcile line item"})
		}
	}

	return c.Status(fiber.StatusCreated).JSON(createdItem)
}
