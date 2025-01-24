package models

type EmissionsFactor struct {
	Id            string `json:"id"`
	ActivityId    string `json:"activity_id"`
	Name          string `json:"name"`
	Description   string `json:"description"`
	Unit          string `json:"unit"`
	UnitType      string `json:"unit_type"`
	Year          int    `json:"year"`
	Region        string `json:"region"`
	Category      string `json:"category"`
	Source        string `json:"source"`
	SourceDataset string `json:"source_dataset"`
}
