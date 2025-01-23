package schema

import (
	"arenius/internal/models"
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type EmissionsFactorRepository struct {
	db *pgxpool.Pool
}

func (r *EmissionsFactorRepository) AddEmissionsFactors(ctx context.Context, emissionFactors []models.EmissionsFactor) ([]models.EmissionsFactor, error) {
	const query = `
        INSERT INTO emission_factor (
						id,
            activity_id,
            name,
            description,
            unit,
            unit_type,
            year,
            region,
            category,
            source,
            source_dataset
        )
        SELECT * FROM unnest($1::text[], $2::text[], $3::text[], $4::text[], $5::text[], 
                            $6::text[], $7::integer[], $8::text[], $9::text[], $10::text[], $11::text[])
        ON CONFLICT (id) DO NOTHING
    `

	// Create slices to hold the column values
	ids := make([]string, len(emissionFactors))
	activityIds := make([]string, len(emissionFactors))
	names := make([]string, len(emissionFactors))
	descriptions := make([]string, len(emissionFactors))
	units := make([]string, len(emissionFactors))
	unitTypes := make([]string, len(emissionFactors))
	years := make([]int, len(emissionFactors))
	regions := make([]string, len(emissionFactors))
	categories := make([]string, len(emissionFactors))
	sources := make([]string, len(emissionFactors))
	sourceDatasets := make([]string, len(emissionFactors))

	// Populate the slices
	for i, ef := range emissionFactors {
		ids[i] = ef.Id
		activityIds[i] = ef.ActivityId
		names[i] = ef.Name
		descriptions[i] = ef.Description
		units[i] = ef.Unit
		unitTypes[i] = ef.UnitType
		years[i] = ef.Year
		regions[i] = ef.Region
		categories[i] = ef.Category
		sources[i] = ef.Source
		sourceDatasets[i] = ef.SourceDataset
	}

	// Execute the bulk insert
	_, err := r.db.Exec(ctx, query,
		ids,
		activityIds,
		names,
		descriptions,
		units,
		unitTypes,
		years,
		regions,
		categories,
		sources,
		sourceDatasets,
	)

	if err != nil {
		return nil, err
	}

	return emissionFactors, nil
}

func NewEmissionsFactorRepository(db *pgxpool.Pool) *EmissionsFactorRepository {
	return &EmissionsFactorRepository{
		db,
	}
}
