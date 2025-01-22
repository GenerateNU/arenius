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
                            $6::integer[], $7::text[], $8::text[], $9::text[], $10::text[])
        ON CONFLICT (activity_id) DO NOTHING
    `

	// Create slices to hold the column values
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
	// const query = `
	// 	INSERT INTO emission_factor (
	// 				activity_id, name, description, unit, unit_type, year, region, category, source, source_dataset
	// 			)
	// 			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	// 			ON CONFLICT (activity_id) DO NOTHING`

	// _, err := r.db.Exec(ctx, query, emissionFactor.ActivityId,
	// 	emissionFactor.Name,
	// 	emissionFactor.Description,
	// 	emissionFactor.Unit,
	// 	emissionFactor.UnitType,
	// 	emissionFactor.Year,
	// 	emissionFactor.Region,
	// 	emissionFactor.Category,
	// 	emissionFactor.Source,
	// 	emissionFactor.SourceDataset)
	// if err != nil {
	// 	return models.EmissionsFactor{}, err
	// }

	// return emissionFactor, nil
}

func NewEmissionsFactorRepository(db *pgxpool.Pool) *EmissionsFactorRepository {
	return &EmissionsFactorRepository{
		db,
	}
}
