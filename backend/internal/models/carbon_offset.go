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
