package summary

import (
	"arenius/internal/errs"
	"arenius/internal/models"
	"fmt"

	"github.com/gofiber/fiber/v2"
)

func (h *Handler) GetGrossSummary(c *fiber.Ctx) error {
	var req models.GetGrossSummaryRequest
	if err := c.BodyParser(&req); err != nil {
		return errs.BadRequest(fmt.Sprintf("error parsing request body: %v", err))
	}

	if req.CompanyID == "" {
		return errs.BadRequest("Company ID is required")
	}

	if req.MonthDuration == 0 {
		return errs.BadRequest("Month duration is required")
	}

	grossSummary, err := h.summaryRepository.GetGrossSummary(c.Context(), req)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(grossSummary)
}

func (h *Handler) GetNetSummary(c *fiber.Ctx) error {
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

	netSummary, err := h.summaryRepository.GetNetSummary(
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
