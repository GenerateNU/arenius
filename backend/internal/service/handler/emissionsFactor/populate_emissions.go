package emissionsFactor

import (
	"arenius/internal/models"
	"arenius/internal/service/climatiq"
	"arenius/internal/service/ctxt"
	"fmt"
	"net/http"

	"github.com/gofiber/fiber/v2"
)

func (h *Handler) PopulateEmissions(c *fiber.Ctx) error {
	climatiqClient, err := ctxt.GetClimatiqClient(c)
	if err != nil {
		return c.Status(http.StatusInternalServerError).SendString(err.Error())
	}

	searchReq := &climatiq.SearchRequest{
		DataVersion:    "latest",
		ResultsPerPage: 100,
	}

	page := 1
	for {
		fmt.Printf("Fetching page %d\n", page)
		searchReq.Page = page
		searchReq.DataVersion = "^20"
		response, err := climatiqClient.Search(c.Context(), searchReq)
		if err != nil {
			return c.Status(http.StatusInternalServerError).SendString(
				fmt.Sprintf("Error fetching emissions data: %v", err.Error()),
			)
		}

		// Convert search results to emission factors
		emissionFactors := make([]models.EmissionsFactor, len(response.Results))
		for i, result := range response.Results {
			emissionFactors[i] = models.EmissionsFactor{
				ActivityId:    result.ActivityID,
				Name:          result.Name,
				Description:   result.Description,
				Unit:          result.Unit,
				UnitType:      result.UnitType,
				Year:          result.Year,
				Region:        result.Region,
				Category:      result.Category,
				Source:        result.Source,
				SourceDataset: result.SourceLCAActivity, // Using SourceLCAActivity as SourceDataset
			}
		}

		// Bulk insert the emission factors
		_, err = h.emissionsFactorRepository.AddEmissionsFactors(c.Context(), emissionFactors)
		if err != nil {
			return c.Status(http.StatusInternalServerError).SendString(
				fmt.Sprintf("Error inserting emissions data: %v", err.Error()),
			)
		}

		if page >= response.LastPage {
			break
		}
		page++
	}
	// for {
	// 	searchReq.Page = page
	// 	response, err := climatiqClient.Search(c.Context(), searchReq)
	// 	if err != nil {
	// 		return c.Status(http.StatusInternalServerError).SendString(fmt.Sprintf("Error fetching emissions data: %v", err.Error()))
	// 	}

	// 	for _, result := range response.Results {
	// 		_, err := h.emissionsFactorRepository.AddEmissionsFactor(c.Context(), req)
	// 		if err != nil {
	// 			return c.Status(http.StatusInternalServerError).SendString(fmt.Sprintf("Error inserting emissions data: %v", err.Error()))
	// 		}
	// 	}

	// 	if page >= response.LastPage {
	// 		break
	// 	}
	// 	page++
	// }

	return c.JSON("Emissions data populated successfully.")
}
