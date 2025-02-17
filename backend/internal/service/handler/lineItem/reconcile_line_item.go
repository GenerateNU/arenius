package lineItem

import (
	"arenius/internal/errs"
	"arenius/internal/models"
	"fmt"

	"github.com/gofiber/fiber/v2"
)

func (h *Handler) ReconcileLineItem(c *fiber.Ctx) error {

	var req models.ReconcileLineItemRequest

	if err := c.BodyParser(&req); err != nil {
		return errs.BadRequest(fmt.Sprint("invalid request body: ", err))
	}

	lineItem, err := h.lineItemRepository.ReconcileLineItem(c.Context(), c.Params("id"), req)
	if err != nil {
		return errs.BadRequest(err.Error())
	}

	return c.Status(fiber.StatusOK).JSON(lineItem)
}
