package models

import (
	"time"

	"github.com/google/uuid"
)

type LineItem struct {
	ID                          string    `json:"id"`
	XeroLineItemID              *string   `json:"xero_line_item_id,omitempty"`
	Description                 string    `json:"description"`
	TotalAmount                 float64   `json:"total_amount"`
	CompanyID                   string    `json:"company_id"`
	ContactID                   string    `json:"contact_id"`
	Date                        time.Time `json:"date"`
	CurrencyCode                string    `json:"currency_code"`
	EmissionFactorId            *string   `json:"emission_factor_id,omitempty"`
	RecommendedEmissionFactorId *string   `json:"recommended_emission_factor_id,omitempty"`
	CO2                         *float64  `json:"co2,omitempty"`
	Scope                       *int      `json:"scope,omitempty"`
	RecommendedScope            *int      `json:"recommended_scope,omitempty"`
	CO2Unit                     *string   `json:"co2_unit,omitempty"`
}

type LineItemWithDetails struct {
	LineItem
	RecommendedEmissionFactorName *string `json:"recommended_emission_factor_name,omitempty"`
	EmissionFactorName            *string `json:"emission_factor_name,omitempty"`
	ContactName                   *string `json:"contact_name,omitempty"`
}

type GetLineItemsResponse struct {
	Total     int                   `json:"total"`
	Count     int                   `json:"count"`
	LineItems []LineItemWithDetails `json:"line_items"`
}

type ReconcileLineItemRequest struct {
	ID              string  `json:"id"`
	EmissionsFactor string  `json:"emission_factor,omitempty"`
	Scope           int     `json:"scope,omitempty"`
	ContactID       *string `json:"contact_id,omitempty"`
}

type LineItemEmissionsRequest struct {
	LineItemId string  `json:"line_item_id"`
	CO2        float64 `json:"co2,omitempty"`
	CO2Unit    string  `json:"co2_unit,omitempty"`
}

type UpdateLineItemsRequest struct {
	LineItemIDs       []uuid.UUID `json:"line_item_ids"`
	Scope             *int        `json:"scope,omitempty"`
	EmissionsFactorID *string     `json:"emissions_factor_id,omitempty"`
}

type CreateLineItemRequest struct {
	Description      string   `json:"description"`
	TotalAmount      float64  `json:"total_amount"`
	CompanyID        string   `json:"company_id"`
	ContactID        string   `json:"contact_id"`
	CurrencyCode     string   `json:"currency_code"`
	EmissionFactorId *string  `json:"emission_factor_id,omitempty"`
	CO2              *float64 `json:"co2,omitempty"`
	Scope            *int     `json:"scope,omitempty"`
	CO2Unit          *string  `json:"co2_unit,omitempty"`
	Date             *string  `json:"date,omitempty"`
}

type GetLineItemsRequest struct {
	CompanyID            *string    `query:"company_id"`
	ReconciliationStatus *string    `query:"reconciliation_status"`
	BeforeDate           *time.Time `query:"before_date"`
	AfterDate            *time.Time `query:"after_date"`
	Scope                *int       `query:"scope"`
	EmissionFactor       *string    `query:"emission_factor"`
	SearchTerm           *string    `query:"search_term"`
	MinPrice             *float64   `query:"min_price"`
	MaxPrice             *float64   `query:"max_price"`
	ContactID            *string    `query:"contact_id"`
	Unpaginated          *bool      `query:"unpaginated"`
}

type AddImportedLineItemRequest struct {
	XeroLineItemID string    `json:"xero_line_item_id,omitempty"`
	Description    string    `json:"description"`
	TotalAmount    float64   `json:"total_amount"`
	CompanyID      string    `json:"company_id"`
	ContactID      string    `json:"contact_id"`
	Date           time.Time `json:"date"`
	CurrencyCode   string    `json:"currency_code"`
}

type PastLineItemDetails struct {
	Description       string `json:"description"`
	EmissionsFactor   string `json:"emissions_factor"`
	EmissionsFactorID string `json:"emissions_factor_id"`
	Scope             int    `json:"scope"`
}

type UnreconciledLineItem struct {
	ID          string `json:"id"`
	Description string `json:"description"`
}

type LineItemReconciliationQuery struct {
	PastTransactions         []PastLineItemDetails  `json:"past_transactions"`
	UnreconciledTransactions []UnreconciledLineItem `json:"unreconciled_transactions"`
}

type Recommendation struct {
	ID                           string  `json:"id"`
	RecommendedScope             int     `json:"recommended_scope"`
	RecommendedEmissionsFactor   string  `json:"recommended_emissions_factor"`
	RecommendedEmissionsFactorID string  `json:"recommended_emissions_factor_id"`
	MatchedDescription           string  `json:"matched_description"`
	Similarity                   float64 `json:"similarity"`
}
