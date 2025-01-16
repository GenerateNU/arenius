package carbon

import (
	"arenius/internal/service/climatiq"
	"arenius/internal/service/ctxt"
	"net/http"

	"github.com/gofiber/fiber/v2"
)

func (h *Handler) EstimateCarbonEmissions(c *fiber.Ctx) error {
	climatiqClient, err := ctxt.GetClimatiqClient(c)
	if err != nil {
		return c.Status(http.StatusInternalServerError).SendString(err.Error())
	}

	// Define the payload with estimates as the root
	estimates := []climatiq.EstimateRequest{
		{
			EmissionFactor: climatiq.EmissionFactor{
				ActivityID:  "electricity-supply_grid-source_residual_mix",
				DataVersion: "^6",
			},
			Parameters: climatiq.Parameters{
				Energy:     100,
				EnergyUnit: "kWh",
			},
		},
		{
			EmissionFactor: climatiq.EmissionFactor{
				ActivityID:  "electricity-supply_grid-source_residual_mix",
				DataVersion: "^6",
			},
			Parameters: climatiq.Parameters{
				Energy:     50,
				EnergyUnit: "kWh",
			},
		},
	}

	// Send the estimates directly to the API
	response, err := climatiqClient.BatchEstimate(c.Context(), &estimates)
	if err != nil {
		return c.Status(http.StatusInternalServerError).SendString(err.Error())
	}

	return c.JSON(response)
}
