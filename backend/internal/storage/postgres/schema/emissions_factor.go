package schema

import (
	"arenius/internal/models"
	"context"
	"errors"
	"fmt"
	"sort"
	"time"

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

func (r *EmissionsFactorRepository) GetEmissionFactors(ctx context.Context, companyId string, searchTerm string) (*models.Categories, error) {
	searchQuery := ""

	if searchTerm != "" {
		searchQuery += fmt.Sprintf(" AND (emission_factor.name ILIKE '%%%s%%' OR emission_factor.category ILIKE '%%%s%%')", searchTerm, searchTerm)
	}

	query := `
		WITH latest_emission AS (
		SELECT *,
			ROW_NUMBER() OVER (PARTITION BY activity_id ORDER BY year DESC) AS rn
		FROM emission_factor
		WHERE region = 'US' AND unit_type = 'Money'` + searchQuery + `
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

	categoryMap := make(map[string][]models.EmissionsFactor)

	favoriteEmissionsFactors := make([]models.EmissionsFactor, 0, 10)

	historyEmissionsFactors := make([]models.EmissionsFactor, 0, 10)

	categories := make([]models.Category, 0, len(categoryMap)+1)

	if companyId != "" {
		favoriteQuery := `
			SELECT id, activity_id, name, description, unit, unit_type, year, region, category, source, source_dataset
			FROM emission_factor JOIN company_favorite ON emission_factor.id = company_favorite.emissions_factor_id
			WHERE company_favorite.company_id = $1` + searchQuery + `
			ORDER BY emission_factor.name;
		`

		favoriteRows, favoriteErr := r.db.Query(ctx, favoriteQuery, companyId)
		if favoriteErr != nil {
			return nil, favoriteErr
		}
		defer favoriteRows.Close()

		favorites, err := pgx.CollectRows(favoriteRows, pgx.RowToStructByName[models.EmissionsFactor])
		if err != nil {
			return nil, err
		}

		if favoriteRowsErr := favoriteRows.Err(); favoriteRowsErr != nil {
			return nil, fmt.Errorf("error iterating over favorite emission factor rows: %w", favoriteRowsErr)
		}

		favoriteEmissionsFactors = favorites
	}

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

	for categoryName, factors := range categoryMap {
		categories = append(categories, models.Category{
			Name:             categoryName,
			EmissionsFactors: factors,
		})
	}

	sort.Slice(categories, func(i, j int) bool {
		return categories[i].Name < categories[j].Name
	})

	categoriesSummary := models.Categories{
		All:       categories,
		Favorites: models.Category{Name: "Favorites", EmissionsFactors: favoriteEmissionsFactors},
		History:   models.Category{Name: "History", EmissionsFactors: historyEmissionsFactors},
	}

	return &categoriesSummary, nil
}

func (r *EmissionsFactorRepository) PostFavoriteEmissionFactors(ctx context.Context, companyId string, emissionFactorId string, setFavorite bool) error {
	if setFavorite {
		insertQuery := `
			WITH inserted AS (
				INSERT INTO company_favorite (company_id, emissions_factor_id, date)
				VALUES ($1, $2, $3)
				ON CONFLICT (company_id, emissions_factor_id) DO NOTHING
				RETURNING *
			)
			SELECT * FROM inserted
			UNION ALL
			SELECT * FROM company_favorite WHERE company_id = $1 AND emissions_factor_id = $2
			LIMIT 1;
		`

		rows, err := r.db.Query(ctx, insertQuery, companyId, emissionFactorId, time.Now().UTC())
		if err != nil {
			return fmt.Errorf("error inserting company favorite: %w", err)
		}
		defer rows.Close()

		return nil
	} else {
		deleteQuery := `
			DELETE FROM company_favorite
			WHERE company_id = $1
			AND emissions_factor_id = $2
			RETURNING *;
		`

		rows, err := r.db.Query(ctx, deleteQuery, companyId, emissionFactorId)
		if err != nil {
			return fmt.Errorf("error deleting company favorite: %w", err)
		}
		defer rows.Close()

		return nil
	}
}

func NewEmissionsFactorRepository(db *pgxpool.Pool) *EmissionsFactorRepository {
	return &EmissionsFactorRepository{
		db,
	}
}
