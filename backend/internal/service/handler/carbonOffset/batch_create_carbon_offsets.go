package carbonOffset

import (
	"arenius/internal/errs"
	"arenius/internal/models"
	"fmt"

	"github.com/gofiber/fiber/v2"
)

func (h *Handler) BatchCreateCarbonOffsets(c *fiber.Ctx) error {
	var req models.BatchCreateCarbonOffsetsRequest
	if err := c.BodyParser(&req); err != nil {
		return errs.BadRequest(fmt.Sprintf("error parsing request body: %v", err))
	}

	if len(req.CarbonOffsets) == 0 {
		return errs.BadRequest("no carbon offsets to insert")
	}

	createdItems, err := h.OffsetRepository.BatchCreateCarbonOffsets(c.Context(), req)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusCreated).JSON(createdItems)
}
