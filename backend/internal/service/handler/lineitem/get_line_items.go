package lineitem

import (
	"arenius/internal/errs"
	"arenius/internal/service/utils"
	"fmt"

	"github.com/gofiber/fiber/v2"
)

func (h *Handler) GetLineItems(c *fiber.Ctx) error {
	var pagination utils.Pagination
	if err := c.QueryParser(&pagination); err != nil {
		return errs.BadRequest(fmt.Sprint("invalid pagination query parameters: ", err))
	}

	if errors := pagination.Validate(); len(errors) > 0 {
		return errs.BadRequest(fmt.Sprint("invalid pagination values: ", errors))
	}

	lineItems, err := h.lineItemRepository.GetLineItems(c.Context(), pagination)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(lineItems)
}
