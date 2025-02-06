package lineItem 

import (
	"arenius/internal/errs"
	"arenius/internal/models"
	"fmt"

	"github.com/gofiber/fiber/v2"
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
	if req.UnitAmount == 0 {
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

	return c.Status(fiber.StatusCreated).JSON(createdItem)
}
