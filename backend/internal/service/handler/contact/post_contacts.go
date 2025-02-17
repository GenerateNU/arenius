package contact 

import (
	"arenius/internal/errs"
	"arenius/internal/models"
	"fmt"

	"github.com/gofiber/fiber/v2"
)
 
func (h *Handler) PostContact(c *fiber.Ctx) error {
	var req models.CreateContactRequest
	if err := c.BodyParser(&req); err != nil {
		return errs.BadRequest(fmt.Sprintf("error parsing request body: %v", err))
	}

	// ensure that all required fields are present
	if req.Name == "" {
		return errs.BadRequest("Name is required")
	}
	if req.Email == "" {
		return errs.BadRequest("Email is required")
	}
	if req.Phone == "" {
		return errs.BadRequest("Phone is required")
	}
	if req.City == "" {
		return errs.BadRequest("City is required")
	}
	if req.State == "" {
		return errs.BadRequest("State is required")
	}
	if req.CompanyID == "" {
		return errs.BadRequest("Company ID is required")
	}

	createdContact, err := h.contactRepository.CreateContact(c.Context(), req)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusCreated).JSON(createdContact)
}
