package lineitem

import (
	"arenius/internal/errs"
	"arenius/internal/models"
	"arenius/internal/service/climatiq"
	"arenius/internal/service/ctxt"
	"fmt"
	"net/http"
	"strings"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/sync/errgroup"
)

func (h *Handler) EstimateCarbonEmissions(c *fiber.Ctx) error {
	climatiqClient, err := ctxt.GetClimatiqClient(c)
	if err != nil {
		return c.Status(http.StatusInternalServerError).SendString(err.Error())
	}

	// Parse the incoming request body into a slice of LineItems
	var lineItems []models.LineItem
	if err := c.BodyParser(&lineItems); err != nil {
		return errs.BadRequest(fmt.Sprintf("invalid request body: %v", err))
	}

	// Transform line items into Climatiq EstimateRequest payloads
	var estimates []climatiq.EstimateRequest
	for _, item := range lineItems {
		if item.EmissionFactorId == nil || *item.EmissionFactorId == "" {
			return errs.BadRequest(fmt.Sprintf("missing required fields for line item ID %s: emission_factor_id is required", item.ID))
		}

		estimates = append(estimates, climatiq.EstimateRequest{
			EmissionFactor: climatiq.EmissionFactor{
				ID: *item.EmissionFactorId,
			},
			Parameters: climatiq.Parameters{
				Money:     item.UnitAmount * item.Quantity,
				MoneyUnit: strings.ToLower(item.CurrencyCode),
			},
		})
	}

	// Send the estimates directly to the Climatiq API
	response, err := climatiqClient.BatchEstimate(c.Context(), &estimates)
	if err != nil {
		return c.Status(http.StatusInternalServerError).SendString(fmt.Sprintf("error estimating carbon emissions: %v", err))
	}

	// Concurrently update line items with the CO2 data
	var updatedLineItems []models.LineItem
	eg, ctx := errgroup.WithContext(c.Context())

	results := make([]*models.LineItem, len(response.Results))
	for i, result := range response.Results {
		i, result := i, result // Capture loop variables

		eg.Go(func() error {
			if i >= len(lineItems) {
				return nil
			}

			lineItem := lineItems[i]
			updateReq := models.LineItemEmissionsRequest{
				LineItemId: lineItem.ID,
				CO2:        result.CO2e,
				CO2Unit:    result.CO2eUnit,
			}

			updatedLineItem, err := h.lineItemRepository.AddLineItemEmissions(ctx, updateReq)
			if err != nil {
				return fmt.Errorf("error updating line item %s: %w", lineItem.ID, err)
			}

			results[i] = updatedLineItem
			return nil
		})
	}

	// Wait for all updates to complete
	if err := eg.Wait(); err != nil {
		return c.Status(http.StatusInternalServerError).SendString(fmt.Sprintf("error during updates: %v", err))
	}

	// Collect non-nil results
	for _, item := range results {
		if item != nil {
			updatedLineItems = append(updatedLineItems, *item)
		}
	}

	// Return the API response as JSON
	return c.JSON(updatedLineItems)
}
