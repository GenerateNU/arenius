package lineitem 

import (
	"arenius/internal/errs"
	"arenius/internal/models"
	"fmt"

	"github.com/gofiber/fiber/v2"
)

func (h *Handler) ReconcileLineItem(c *fiber.Ctx) error {


	lineItemId := c.Params("id")
	var req models.ReconcileLineItemRequest

	if err := c.BodyParser(&req); err != nil {
		return errs.BadRequest(fmt.Sprint("invalid request body: ", err))
	}

	lineitem, err := h.lineItemRepository.ReconcileLineItem(c.Context(), lineItemId, req)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(lineitem)
}
