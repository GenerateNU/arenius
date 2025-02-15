package schema

import (
	"arenius/internal/models"
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
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

	// Begin transaction
	tx, err := r.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return nil, err
	}

	// Ensure rollback on any error
	defer func() {
		if rollbackErr := tx.Rollback(ctx); rollbackErr != nil && !errors.Is(rollbackErr, pgx.ErrTxClosed) {
			// Log rollback error if it occurs
			fmt.Printf("rollback failed: %v\n", rollbackErr)
		}
	}()

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
	_, execErr := tx.Exec(ctx, query,
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

	if execErr != nil {
		return nil, execErr
	}

	// Commit the transaction
	if commitErr := tx.Commit(ctx); commitErr != nil {
		return nil, commitErr
	}

	return emissionFactors, nil
}

func (r *EmissionsFactorRepository) GetEmissionFactors(ctx context.Context) ([]models.Category, error) {

	const query = `
		WITH latest_emission AS (
		SELECT *,
			ROW_NUMBER() OVER (PARTITION BY activity_id ORDER BY year DESC) AS rn
		FROM emission_factor
		WHERE region = 'US' AND unit_type = 'Money'
		)
		SELECT *
		FROM latest_emission
		WHERE rn = 1
		ORDER BY category, name;
	`
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// parse results into a map of category : list of emissions factor
	categoryMap := make(map[string][]models.EmissionsFactor)
	for rows.Next() {
		var emissionsFactor models.EmissionsFactor
		var rn int // this is unused 
		err := rows.Scan(
			&emissionsFactor.Id,
			&emissionsFactor.ActivityId,
			&emissionsFactor.Name,
			&emissionsFactor.Description,
			&emissionsFactor.Unit,
			&emissionsFactor.UnitType,
			&emissionsFactor.Year,
			&emissionsFactor.Region,
			&emissionsFactor.Category,
			&emissionsFactor.Source,
			&emissionsFactor.SourceDataset,
			&rn,
		)
		if err != nil {
			return nil, err
		}
		categoryMap[emissionsFactor.Category] = append(categoryMap[emissionsFactor.Category], emissionsFactor)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating over emission factor rows: %w", err)
	}

	// convert results into a []models.Category
	categories := make([]models.Category, 0, len(categoryMap))
	for categoryName, factors := range categoryMap {
		categories = append(categories, models.Category{
			Name: categoryName,
			EmissionsFactors: factors,
		})
	}

	return categories, nil

}


func NewEmissionsFactorRepository(db *pgxpool.Pool) *EmissionsFactorRepository {
	return &EmissionsFactorRepository{
		db,
	}
}
