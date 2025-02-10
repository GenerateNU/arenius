package carbonOffset

import (
	"arenius/internal/errs"
	"arenius/internal/models"
	"fmt"

	"github.com/gofiber/fiber/v2"
)

func (h *Handler) PostCarbonOffset(c *fiber.Ctx) error {
	var req models.CarbonOffset
	if err := c.BodyParser(&req); err != nil {
		return errs.BadRequest(fmt.Sprintf("error parsing request body: %v", err))
	}

	createdItem, err := h.OffsetRepository.PostCarbonOffset(c.Context(), req)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusCreated).JSON(createdItem)
}
