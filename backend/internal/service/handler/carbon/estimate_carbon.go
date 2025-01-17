package carbon

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
		if item.EmissionFactor == "" || item.Unit == "" {
			return errs.BadRequest(fmt.Sprintf("missing required fields for line item ID %s: emission_factor_id and unit are required", item.ID))
		}

		estimates = append(estimates, climatiq.EstimateRequest{
			EmissionFactor: climatiq.EmissionFactor{
				ActivityID:  item.EmissionFactor,
				DataVersion: "^20", // Assuming a default version; adjust as needed
			},
			Parameters: climatiq.Parameters{
				Energy:     item.Quantity,
				EnergyUnit: item.Unit,
			},
		})
	}

	// Send the estimates directly to the Climatiq API
	response, err := climatiqClient.BatchEstimate(c.Context(), &estimates)
	if err != nil {
		return c.Status(http.StatusInternalServerError).SendString(fmt.Sprintf("error estimating carbon emissions: %v", err))
	}

	// Return the API response as JSON
	return c.JSON(response)

	// var req []models.LineItem
	// if err := c.BodyParser(&req); err != nil {
	// 	return errs.BadRequest(fmt.Sprint("invalid request body: ", err))
	// }

	// // Define the payload with estimates as the root
	// estimates := []climatiq.EstimateRequest{
	// 	{
	// 		EmissionFactor: climatiq.EmissionFactor{
	// 			ActivityID:  "electricity-supply_grid-source_residual_mix",
	// 			DataVersion: "^6",
	// 		},
	// 		Parameters: climatiq.Parameters{
	// 			Energy:     100,
	// 			EnergyUnit: "kWh",
	// 		},
	// 	},
	// 	{
	// 		EmissionFactor: climatiq.EmissionFactor{
	// 			ActivityID:  "electricity-supply_grid-source_residual_mix",
	// 			DataVersion: "^6",
	// 		},
	// 		Parameters: climatiq.Parameters{
	// 			Energy:     50,
	// 			EnergyUnit: "kWh",
	// 		},
	// 	},
	// }

	// // Send the estimates directly to the API
	// response, err := climatiqClient.BatchEstimate(c.Context(), &estimates)
	// if err != nil {
	// 	return c.Status(http.StatusInternalServerError).SendString(err.Error())
	// }

	// return c.JSON(response)
}
