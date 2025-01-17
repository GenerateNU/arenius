package lineitem

import (
	"arenius/internal/errs"
	"arenius/internal/models"
	"fmt"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

func (h *Handler) ReconcileLineItem(c *fiber.Ctx) error {

	fmt.Println("Did we get here")

	lineItemId, err := strconv.Atoi(c.Params("id"))

	if err != nil {
		return err
	}

	var req models.ReconcileLineItemRequest

	if err := c.BodyParser(&req); err != nil {
		return errs.BadRequest(fmt.Sprint("invalid request body: ", err))
	}

	// assert that all the fields are there
	if req.EmissionsFactor == "" {
		return errs.BadRequest("Emission factor cannot be empty in request.")
	}
	if req.Amount == 0 {
		return errs.BadRequest("Amount cannot be empty in request.")
	}
	if req.Unit == "" {
		return errs.BadRequest("Unit cannot be empty in request.")
	}

	lineitem, err := h.lineItemRepository.ReconcileLineItem(c.Context(), lineItemId, req)
	if err != nil {
		return errs.BadRequest(err.Error())
	}

	return c.Status(fiber.StatusOK).JSON(lineitem)
}
