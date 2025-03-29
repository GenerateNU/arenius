package models

import (
	"time"

	"github.com/google/uuid"
)

type CarbonOffset struct {
	ID             int       `json:"id"`
	CarbonAmountKg float64   `json:"carbon_amount_kg"`
	CompanyID      uuid.UUID `json:"company_id"`
	Source         string    `json:"source"`
	PurchaseDate   time.Time `json:"purchase_date"`
}

type GetCarbonOffsetsRequest struct {
	CompanyId  *string    `query:"company_id"`
	SearchTerm *string    `query:"search_term"`
	BeforeDate *time.Time `query:"before_date"`
	AfterDate  *time.Time `query:"after_date"`
}

type CreateCarbonOffsetRequest struct {
	CarbonAmountKg float64   `json:"carbon_amount_kg"`
	CompanyID      uuid.UUID `json:"company_id"`
	Source         string    `json:"source"`
	PurchaseDate   time.Time `json:"purchase_date"`
}

type BatchCreateCarbonOffsetsRequest struct {
	CarbonOffsets []CreateCarbonOffsetRequest `json:"carbon_offsets"`
}
