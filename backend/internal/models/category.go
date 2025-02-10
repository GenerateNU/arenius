package models

type Category struct {
	Name             string            `json:"name"`
	EmissionsFactors []EmissionsFactor `json:"emissions_factors"`
}
