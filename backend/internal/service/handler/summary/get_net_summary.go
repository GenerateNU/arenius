package summary

import (
	"arenius/internal/errs"
	"arenius/internal/models"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
)

func (h *Handler) GetNetSummary(c *fiber.Ctx) error {
	var req models.GetSummaryRequest
	if err := c.QueryParser(&req); err != nil {
		return errs.BadRequest(fmt.Sprintf("error parsing request body: %v", err))
	}

	fmt.Println("GetNetSummary called with request:", req)

	if req.CompanyID == "" {
		return errs.BadRequest("Company ID is required")
	}

	if (req.StartDate == time.Time{} || req.EndDate == time.Time{}) {
		// Make default start date 3 months ago and default end date today if either are missing
		req.StartDate = time.Now().AddDate(0, -3, 0)
		req.EndDate = time.Now()
	}

	fmt.Println("GetNetSummary updated request:", req)

	grossSummary, err := h.summaryRepository.GetNetSummary(c.Context(), req)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(grossSummary)
}
