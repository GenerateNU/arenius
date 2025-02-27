package models

import "time"

type LineItem struct {
	ID               string    `json:"id"`
	XeroLineItemID   *string   `json:"xero_line_item_id,omitempty"`
	Description      string    `json:"description"`
	TotalAmount      float64   `json:"total_amount"`
	CompanyID        string    `json:"company_id"`
	ContactID        string    `json:"contact_id"`
	Date             time.Time `json:"date"`
	CurrencyCode     string    `json:"currency_code"`
	EmissionFactorId *string   `json:"emission_factor_id,omitempty"`
	CO2              *float64  `json:"co2,omitempty"`
	Scope            *int      `json:"scope,omitempty"`
	CO2Unit          *string   `json:"co2_unit,omitempty"`
}

type LineItemWithDetails struct {
	LineItem
	EmissionFactorName *string `json:"emission_factor_name,omitempty"`
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

type CreateLineItemRequest struct {
	Description    string   `json:"description"`
	TotalAmount    float64  `json:"total_amount"`
	CompanyID      string   `json:"company_id"`
	ContactID      string   `json:"contact_id"`
	CurrencyCode   string   `json:"currency_code"`
	EmissionFactor *string  `json:"emission_factor,omitempty"`
	CO2            *float64 `json:"co2,omitempty"`
	Scope          *int     `json:"scope,omitempty"`
	CO2Unit        *string  `json:"co2_unit,omitempty"`
}

type GetLineItemsRequest struct {
	CompanyID            *string    `query:"company_id"`
	ReconciliationStatus *bool      `query:"reconciliation_status"`
	BeforeDate           *time.Time `query:"before_date"`
	AfterDate            *time.Time `query:"after_date"`
	Scope                *int       `query:"scope"`
	EmissionFactor       *string    `query:"emission_factor"`
	SearchTerm           *string    `query:"search_term"`
	MinPrice             *float64   `query:"min_price"`
	MaxPrice             *float64   `query:"max_price"`
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
