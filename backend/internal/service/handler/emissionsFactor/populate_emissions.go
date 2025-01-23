package emissionsFactor

import (
	"arenius/internal/models"
	"arenius/internal/service/climatiq"
	"arenius/internal/service/ctxt"
	"fmt"
	"net/http"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/sync/errgroup"
)

func (h *Handler) PopulateEmissions(c *fiber.Ctx) error {
	climatiqClient, err := ctxt.GetClimatiqClient(c)
	if err != nil {
		return c.Status(http.StatusInternalServerError).SendString(err.Error())
	}

	// Initial request to get the total number of pages
	searchReq := &climatiq.SearchRequest{
		DataVersion:    "^20",
		ResultsPerPage: 500,
		Page:           1,
	}
	initialResponse, err := climatiqClient.Search(c.Context(), searchReq)
	if err != nil {
		return c.Status(http.StatusInternalServerError).SendString(
			fmt.Sprintf("Error fetching emissions data: %v", err.Error()),
		)
	}
	totalPages := initialResponse.LastPage + 1

	// Create a slice to store emissions data from all pages
	emissionFactors := make([][]models.EmissionsFactor, totalPages)

	// Use an error group for concurrency
	eg, ctx := errgroup.WithContext(c.Context())
	eg.SetLimit(8)

	for page := 0; page <= totalPages; page++ {
		page := page
		eg.Go(func() error {

			searchReq.Page = page
			response, err := climatiqClient.Search(ctx, searchReq)
			if err != nil {
				return fmt.Errorf("error fetching emissions data for page %d: %w", page, err)
			}

			// Convert search results to emission factors
			pageFactors := make([]models.EmissionsFactor, len(response.Results))
			for i, result := range response.Results {
				pageFactors[i] = models.EmissionsFactor{
					Id:            result.ID,
					ActivityId:    result.ActivityID,
					Name:          result.Name,
					Description:   result.Description,
					Unit:          result.Unit,
					UnitType:      result.UnitType,
					Year:          result.Year,
					Region:        result.Region,
					Category:      result.Category,
					Source:        result.Source,
					SourceDataset: result.SourceLink,
				}
			}

			// Store the results in the slice
			emissionFactors[page-1] = pageFactors
			return nil
		})
	}

	// Wait for all goroutines to finish
	if err := eg.Wait(); err != nil {
		return c.Status(http.StatusInternalServerError).SendString(
			fmt.Sprintf("Error populating emissions data: %v", err.Error()),
		)
	}

	// Flatten the results and perform a bulk insert
	var allFactors []models.EmissionsFactor
	for _, factors := range emissionFactors {
		allFactors = append(allFactors, factors...)
	}

	_, err = h.emissionsFactorRepository.AddEmissionsFactors(c.Context(), allFactors)
	if err != nil {
		return c.Status(http.StatusInternalServerError).SendString(
			fmt.Sprintf("Error inserting emissions data: %v", err.Error()),
		)
	}

	return c.JSON("Emissions data populated successfully.")
}
