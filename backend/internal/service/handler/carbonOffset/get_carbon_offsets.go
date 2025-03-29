package carbonOffset

import (
	"arenius/internal/errs"
	"arenius/internal/models"
	"arenius/internal/service/utils"
	"fmt"

	"github.com/gofiber/fiber/v2"
)

func (h *Handler) GetCarbonOffsets(c *fiber.Ctx) error {
	var pagination utils.Pagination
	if err := c.QueryParser(&pagination); err != nil {
		return errs.BadRequest(fmt.Sprint("invalid pagination query parameters: ", err))
	}

	if errors := pagination.Validate(); len(errors) > 0 {
		return errs.BadRequest(fmt.Sprint("invalid pagination values: ", errors))
	}

	var filterParams models.GetCarbonOffsetsRequest

	if err := c.QueryParser(&filterParams); err != nil {
		return errs.BadRequest(fmt.Sprintf("error parsing request body: %v", err))
	}

	carbonOffsets, err := h.OffsetRepository.GetCarbonOffsets(c.Context(), pagination, filterParams)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusCreated).JSON(carbonOffsets)
}
