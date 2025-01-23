package climatiq

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/google/go-querystring/query"
)

// SearchRequest contains query parameters to get emission
// factors. All fields are transformed into a query string
// that is sent in a GET request.
//
// dataVersion is REQUIRED
type SearchRequest struct {
	DataVersion             string   `url:"data_version"`
	Query                   string   `url:"query,omitempty"`
	ActivityID              string   `url:"activity_id,omitempty"`
	Category                string   `url:"category,omitempty"`
	Sector                  string   `url:"sector,omitempty"`
	Source                  string   `url:"source,omitempty"`
	SourceDataset           string   `url:"source_dataset,omitempty"`
	Year                    int      `url:"year,omitempty"`
	Region                  string   `url:"region,omitempty"`
	UnitType                string   `url:"unit_type,omitempty"` // enum TODO
	SourceLCAActivity       string   `url:"source_lca_activity,omitempty"`
	CalculationMethod       string   `url:"calculation_method,omitempty"`
	AllowedDataQualityFlags []string `url:"allowed_data_quality_flags,omitempty"`
	AccessType              string   `url:"access_type,omitempty"`
	Page                    int      `url:"page,omitempty"`
	ResultsPerPage          int      `url:"results_per_page,omitempty"` // MAX 100
}

type SearchResponse struct {
	Results      []SearchResults `json:"results"`
	CurrentPage  int             `json:"current_page"`
	LastPage     int             `json:"last_page"`
	TotalResults int             `json:"total_results"`
}

type SearchResults struct {
	ID                          string   `json:"id"`
	ActivityID                  string   `json:"activity_id"`
	AccessType                  string   `json:"access_type"`
	Name                        string   `json:"name"`
	Category                    string   `json:"category"`
	Sector                      string   `json:"sector"`
	Source                      string   `json:"source"`
	SourceLink                  string   `json:"source_link"`
	Uncertainty                 int      `json:"uncertainty"` // number or nil
	Year                        int      `json:"year"`
	YearReleased                int      `json:"year_released"`
	Region                      string   `json:"region"`
	RegionName                  string   `json:"region_name"`
	Description                 string   `json:"description"`
	Unit                        string   `json:"unit"`
	UnitType                    string   `json:"unit_type"`
	SourceLCAActivity           string   `json:"source_lca_activity"`
	SupportedCalculationMethods []string `json:"supported_calculation_methods"`
	Factor                      float64  `json:"factor"`                    // number or null
	FactorCalculationOrigin     string   `json:"factor_calculation_origin"` // climatiq or source
}

// Search GETS the emission factors based on the query or parameters provided
func (c *Client) Search(ctx context.Context, searchReq *SearchRequest) (*SearchResponse, error) {
	paramsURL, err := parseSearchRequest(searchReq)
	if err != nil {
		return nil, err
	}

	searchURL := c.baseURL.String() + "search?" + paramsURL

	fmt.Print("calling climitiq", "\n")
	fmt.Print("searchURL: ", searchURL, "\n")
	fmt.Print("searchReq: ", searchReq, "\n")
	fmt.Print("calling climitiq")

	req, err := http.NewRequestWithContext(context.Background(), "GET", searchURL, http.NoBody)
	if err != nil {
		return nil, err
	}

	resp, err := c.Do(req)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("error bad statuscode from server:%s", resp.Status)
	}

	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var searchResponse SearchResponse
	err = json.Unmarshal(body, &searchResponse)
	if err != nil {
		return nil, err
	}

	fmt.Printf("searchResponse: %+v\n", searchResponse)

	return &searchResponse, nil
}

// parseSearchRequest takes the SearchRequest struct as input
// and encodes the parameters into the correct format
func parseSearchRequest(req *SearchRequest) (string, error) {
	// dataVersion is required by the climatiq API. Read their
	// docs for more information
	if req.DataVersion == "" {
		return "", fmt.Errorf("error: dataVersion must be set")
	}

	v, err := query.Values(req)
	if err != nil {
		return "", err
	}

	// the v.Encode() function returns parameters in alphabetical order
	return v.Encode(), nil
}
