package lineItem

import (
	"arenius/internal/errs"
	"arenius/internal/models"
	"arenius/internal/service/utils"
	"fmt"

	"github.com/gofiber/fiber/v2"
)

func (h *Handler) GetLineItems(c *fiber.Ctx) error {
	var pagination utils.Pagination
	if err := c.QueryParser(&pagination); err != nil {
		return errs.BadRequest(fmt.Sprint("invalid pagination query parameters: ", err))
	}

	var filterParams models.GetLineItemsRequest

	if err := c.QueryParser(&filterParams); err != nil {
		return errs.BadRequest(fmt.Sprintf("error parsing request body: %v", err))
	}

	if filterParams.Unpaginated != nil {
		if errors := pagination.Validate(); len(errors) > 0 {
			return errs.BadRequest(fmt.Sprint("invalid pagination values: ", errors))
		}
	}

	if filterParams.Scope != nil {
		if *filterParams.Scope != 0 &&
			*filterParams.Scope != 1 &&
			*filterParams.Scope != 2 &&
			*filterParams.Scope != 3 {
			return errs.BadRequest("Scope must be 0, 1, 2, or 3")
		}
	}

	lineItems, err := h.lineItemRepository.GetLineItems(c.Context(), pagination, filterParams)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(lineItems)
}
