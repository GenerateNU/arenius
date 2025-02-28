package contact

import (
	"arenius/internal/errs"
	"arenius/internal/models"
	"arenius/internal/service/utils"
	"fmt"

	"github.com/gofiber/fiber/v2"
)

func (h *Handler) GetContacts(c *fiber.Ctx) error {
	var pagination utils.Pagination
	if err := c.QueryParser(&pagination); err != nil {
		return errs.BadRequest(fmt.Sprint("invalid pagination query parameters: ", err))
	}

	if errors := pagination.Validate(); len(errors) > 0 {
		return errs.BadRequest(fmt.Sprint("invalid pagination values: ", errors))
	}

	var filterParams models.GetContactsRequest

	if err := c.QueryParser(&filterParams); err != nil {
		return errs.BadRequest(fmt.Sprintf("error parsing request body: %v", err))
	}

	companyId := c.Params("companyId")

	contacts, err := h.contactRepository.GetContacts(c.Context(), pagination, filterParams, companyId)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(contacts)
}
