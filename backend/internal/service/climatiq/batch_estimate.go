package climatiq

import (
	"bytes"
	"context"
	"fmt"
	"net/http"

	"github.com/goccy/go-json"
)

// BatchEstimateRequest contains the request body for the batch estimate endpoint.
// Each item in the array is a valid body for the non-batch estimate endpoint.

// EstimateRequest represents a single estimation calculation.
type EstimateRequest struct {
	EmissionFactor EmissionFactor `json:"emission_factor"`
	Parameters     Parameters     `json:"parameters"`
}

// EmissionFactor contains the emission factor details.
type EmissionFactor struct {
	ActivityID  string `json:"activity_id"`
	DataVersion string `json:"data_version"`
}

// Parameters contains the parameters for an emission factor.
type Parameters struct {
	Energy     float64 `json:"energy,omitempty"`
	EnergyUnit string  `json:"energy_unit,omitempty"`
}

// BatchEstimateResponse represents the response from the batch estimate endpoint.
type BatchEstimateResponse struct {
	Results []Estimation `json:"results"`
}

// Estimation represents a single estimation result.
type Estimation struct {
	CO2e                  float64              `json:"co2e"`
	CO2eUnit              string               `json:"co2e_unit"`
	CO2eCalculationMethod string               `json:"co2e_calculation_method"`
	CO2eCalculationOrigin string               `json:"co2e_calculation_origin"`
	EmissionFactor        EmissionFactorDetail `json:"emission_factor"`
	ConstituentGases      ConstituentGases     `json:"constituent_gases"`
	ActivityData          ActivityData         `json:"activity_data"`
	AuditTrail            string               `json:"audit_trail"`
}

// EmissionFactorDetail provides details about the emission factor used.
type EmissionFactorDetail struct {
	Name              string   `json:"name"`
	ActivityID        string   `json:"activity_id"`
	ID                string   `json:"id"`
	AccessType        string   `json:"access_type"`
	Source            string   `json:"source"`
	SourceDataset     string   `json:"source_dataset"`
	Year              int      `json:"year"`
	Region            string   `json:"region"`
	Category          string   `json:"category"`
	SourceLCAActivity string   `json:"source_lca_activity"`
	DataQualityFlags  []string `json:"data_quality_flags"`
}

// ConstituentGases represents the breakdown of constituent gases in the estimation.
type ConstituentGases struct {
	CO2eTotal float64  `json:"co2e_total"`
	CO2       *float64 `json:"co2,omitempty"`
	CH4       *float64 `json:"ch4,omitempty"`
	N2O       *float64 `json:"n2o,omitempty"`
}

// ActivityData contains details about the activity that generated the emissions.
type ActivityData struct {
	ActivityValue float64 `json:"activity_value"`
	ActivityUnit  string  `json:"activity_unit"`
}

// BatchEstimate calculates emissions for multiple activities in a single API call.
func (c *Client) BatchEstimate(ctx context.Context, batchReq *[]EstimateRequest) (*BatchEstimateResponse, error) {
	url := c.baseURL.String() + "data/v1/estimate/batch"

	// Encode request body
	body, err := json.Marshal(batchReq)
	if err != nil {
		return nil, fmt.Errorf("error marshalling batch estimate request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(body))
	if err != nil {
		return nil, fmt.Errorf("error creating batch estimate request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := c.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error performing batch estimate request: %w", err)
	}

	defer resp.Body.Close()

	// Check response status
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error bad status code from server: %s", resp.Status)
	}

	// Decode response body
	var batchResponse BatchEstimateResponse
	if err := json.NewDecoder(resp.Body).Decode(&batchResponse); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return &batchResponse, nil
}
