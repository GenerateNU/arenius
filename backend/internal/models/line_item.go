package models

import "time"

type LineItem struct {
	ID               string    `json:"id"`
	XeroLineItemID   *string   `json:"xero_line_item_id,omitempty"`
	Description      string    `json:"description"`
	Quantity         float64   `json:"quantity"`
	UnitAmount       float64   `json:"unit_amount"`
	CompanyID        string    `json:"company_id"`
	ContactID        string    `json:"contact_id"`
	Date             time.Time `json:"date"`
	CurrencyCode     string    `json:"currency_code"`
	EmissionFactorId *string   `json:"emission_factor_id,omitempty"`
	Amount           *float64  `json:"amount,omitempty"`
	Unit             *string   `json:"unit,omitempty"`
	CO2              *float64  `json:"co2,omitempty"`
	Scope            *int      `json:"scope,omitempty"`
	CO2Unit          *string   `json:"co2_unit,omitempty"`
}

type ReconcileLineItemRequest struct {
	ID              string  `json:"id"`
	EmissionsFactor string  `json:"emission_factor,omitempty"`
	Amount          float64 `json:"amount,omitempty"`
	Unit            string  `json:"unit,omitempty"`
}

type LineItemEmissionsRequest struct {
	LineItemId string  `json:"line_item_id"`
	CO2        float64 `json:"co2,omitempty"`
	CO2Unit    string  `json:"co2_unit,omitempty"`
}

type CreateLineItemRequest struct {
	Description    string   `json:"description"`
	Quantity       float64  `json:"quantity"`
	UnitAmount     float64  `json:"unit_amount"`
	CompanyID      string   `json:"company_id"`
	ContactID      string   `json:"contact_id"`
	CurrencyCode   string   `json:"currency_code"`
	EmissionFactor *string  `json:"emission_factor,omitempty"`
	Amount         *float64 `json:"amount,omitempty"`
	Unit           *string  `json:"unit,omitempty"`
	CO2            *float64 `json:"co2,omitempty"`
	Scope          *int     `json:"scope,omitempty"`
	CO2Unit        *string  `json:"co2_unit,omitempty"`
}

type GetLineItemsRequest struct {
	CompanyID            *string    `json:"company_id"`
	Date                 *time.Time `json:"date"`
	ReconciliationStatus *bool      `json:"reconciliation_status"`
}
