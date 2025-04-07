package models

type Category struct {
	Name             string            `json:"name"`
	EmissionsFactors []EmissionsFactor `json:"emissions_factors"`
}

type Categories struct {
	All       []Category `json:"all"`
	Favorites Category   `json:"favorites"`
}
