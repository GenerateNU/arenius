package summary

import (
	"arenius/internal/errs"
	"arenius/internal/models"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
)

<<<<<<< HEAD:backend/internal/service/handler/summary/get_gross_summary.go
func (h *Handler) GetGrossSummary(c *fiber.Ctx) error {
=======
func (h *Handler) GetEmissionSummary(c *fiber.Ctx) error {
>>>>>>> 388110e9799371a14971a86c4b0bf0fd6c5ebd17:backend/internal/service/handler/summary/get_emission_summary.go
	var req models.GetSummaryRequest
	if err := c.QueryParser(&req); err != nil {
		return errs.BadRequest(fmt.Sprintf("error parsing request body: %v", err))
	}

	if req.CompanyID == "" {
		return errs.BadRequest("Company ID is required")
	}

	if (req.StartDate == time.Time{} || req.EndDate == time.Time{}) {
		// Make default start date 3 months ago and default end date today if either are missing
		req.StartDate = time.Now().AddDate(0, -3, 0)
		req.EndDate = time.Now()
	}

	grossSummary, err := h.summaryRepository.GetEmissionSummary(c.Context(), req)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(grossSummary)
}
