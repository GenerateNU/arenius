package lineitem

import (
	"arenius/internal/errs"
	"arenius/internal/models"
	"arenius/internal/service/climatiq"
	"arenius/internal/service/ctxt"
	"fmt"
	"net/http"

	"github.com/gofiber/fiber/v2"
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
		// Ensure EmissionFactorID and Unit are provided
		if item.EmissionFactor == nil || *item.EmissionFactor == "" || item.Unit == nil || *item.Unit == "" {
			return errs.BadRequest(fmt.Sprintf("missing required fields for line item ID %s: emission_factor_id and unit are required", item.ID))
		}

		estimates = append(estimates, climatiq.EstimateRequest{
			EmissionFactor: climatiq.EmissionFactor{
				ActivityID:  *item.EmissionFactor,
				DataVersion: "^20", // Assuming the most recent version; adjust as needed
			},
			Parameters: climatiq.Parameters{
				Energy:     item.UnitAmount,
				EnergyUnit: *item.Unit,
			},
		})
	}

	// Send the estimates directly to the Climatiq API
	response, err := climatiqClient.BatchEstimate(c.Context(), &estimates)
	if err != nil {
		return c.Status(http.StatusInternalServerError).SendString(fmt.Sprintf("error estimating carbon emissions: %v", err))
	}

	// Collect updated line items
	var updatedLineItems []models.LineItem

	// Update each line item in the database with the CO2 data
	for i, result := range response.Results {
		if i >= len(lineItems) {
			break
		}

		lineItem := lineItems[i]
		updateReq := models.LineItemEmissionsRequest{
			LineItemId: lineItem.ID,
			CO2:        result.CO2e,
			CO2Unit:    result.CO2eUnit,
		}

		updatedLineItem, err := h.lineItemRepository.AddLineItemEmissions(c.Context(), updateReq)
		if err != nil {
			return c.Status(http.StatusInternalServerError).SendString(fmt.Sprintf("error updating line item %s: %v", lineItem.ID, err))
		}

		// Add the updated line item to the result collection
		updatedLineItems = append(updatedLineItems, *updatedLineItem)

	}

	// Return the API response as JSON
	return c.JSON(updatedLineItems)
}
