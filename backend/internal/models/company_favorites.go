package models

import "time"

type CompanyFavorites struct {
	CompanyID         string     `json:"company_id"`
	EmissionsFactorID string     `json:"emissions"`
	Date              *time.Time `json:"date"`
}
