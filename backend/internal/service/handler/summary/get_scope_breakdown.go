package summary

import (
	"arenius/internal/errs"

	"github.com/gofiber/fiber/v2"
)

func (h *Handler) GetScopeBreakdown(c *fiber.Ctx) error {
	companyID := c.Query("company_id")
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	if companyID == "" {
		return errs.BadRequest("Company ID is required")
	}
	if startDate == "" {
		return errs.BadRequest("Start Date is required")
	}
	if endDate == "" {
		return errs.BadRequest("End Date is required")
	}

	netSummary, err := h.summaryRepository.GetScopeBreakdown(
		c.Context(),
		companyID,
		startDate,
		endDate,
	)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(netSummary)
}
