package lineItem

import (
	"arenius/internal/errs"
	"arenius/internal/models"
	"context"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

func (h *Handler) PostLineItem(c *fiber.Ctx) error {
	var req models.CreateLineItemRequest
	if err := c.BodyParser(&req); err != nil {
		return errs.BadRequest(fmt.Sprintf("error parsing request body: %v", err))
	}

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

	if req.Date != nil {
		parsedDate, err := time.Parse(time.RFC3339, *req.Date)
		if err != nil {
			return errs.BadRequest(fmt.Sprintf("Invalid date format: %v", err))
		}

		utcDate := parsedDate.UTC().Format(time.RFC3339)
		req.Date = &utcDate
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

	companyId, err := uuid.Parse(req.CompanyID)
	if err != nil {
		fmt.Println("Error parsing company ID for auto reconciliation:", err)
	} else {
		ctx := c.UserContext()

		go func(ctx context.Context, companyId uuid.UUID) {
			_, autoReconcileErr := h.lineItemRepository.AutoReconcileLineItems(ctx, companyId)
			if autoReconcileErr != nil {
				fmt.Println("Async auto-reconciliation error:", autoReconcileErr)
			}
		}(ctx, companyId)
	}

	return c.Status(fiber.StatusCreated).JSON(createdItem)
}
