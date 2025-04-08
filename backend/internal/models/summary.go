package models

import (
	"time"
)

type GetSummaryRequest struct {
	CompanyID string    `query:"company_id"`
	StartDate time.Time `query:"start_date"`
	EndDate   time.Time `query:"end_date"`
}

type GetSummaryResponse struct {
	GrossCO2  float64        `json:"gross_co2"`
	NetCO2    float64        `json:"net_co2"`
	StartDate time.Time      `json:"start_date"`
	EndDate   time.Time      `json:"end_date"`
	Months    []MonthSummary `json:"months"`
}

type MonthSummary struct {
	MonthStart time.Time    `json:"month_start"`
	Scopes     ScopeSummary `json:"scopes"`
	Emissions  float64      `json:"emissions"`
	Offsets    float64      `json:"offsets"`
}

type ScopeSummary struct {
	ScopeOne   float64 `json:"scope_one"`
	ScopeTwo   float64 `json:"scope_two"`
	ScopeThree float64 `json:"scope_three"`
}

type GetContactEmissionsSummaryResponse struct {
	ContactEmissions []ContactEmissionsSummary `json:"contact_emissions"`
	StartDate        time.Time                 `json:"start_date"`
	EndDate          time.Time                 `json:"end_date"`
}

type ContactEmissionsSummary struct {
	ContactID   string  `json:"contact_id"`
	ContactName string  `json:"contact_name"`
	Carbon      float64 `json:"carbon"`
}

type NetSummary struct {
	TotalCO2 float64 `json:"total_co2"`
	ScopeVal int     `json:"scopes"`
}

type GetNetSummaryRequest struct {
	CompanyID string    `json:"company_id"`
	StartDate time.Time `json:"start_date"`
	EndDate   time.Time `json:"end_date"`
}

type GetTopEmissionsResponse struct {
	Rank           int     `json:"rank"`
	EmissionFactor string  `json:"emission_factor"`
	TotalCO2       float64 `json:"total_co2"`
}
