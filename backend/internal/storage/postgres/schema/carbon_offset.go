package schema

import (

	"arenius/internal/models"
	"context"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jackc/pgx/v5"
)

type OffsetRepository struct {
	db *pgxpool.Pool
}

func (r *OffsetRepository) CreateCarbonOffset(ctx context.Context, req models.CreateCarbonOffsetRequest) (*models.CarbonOffset, error) {
	columns := []string{"carbon_amount_kg", "company_id", "source", "purchase_date"}
	queryArgs := []any{
		req.CarbonAmountKg,
		req.CompanyID,
		req.Source,
		req.PurchaseDate,
	}

	var queryPlaceholders []string
	for i := 1; i <= len(columns); i++ {
		queryPlaceholders = append(queryPlaceholders, fmt.Sprintf("$%d", i))
	}

	query := `
		INSERT INTO carbon_offset
		(` + strings.Join(columns, ", ") + `)
		VALUES (` + strings.Join(queryPlaceholders, ", ") + `)
		RETURNING id, carbon_amount_kg, company_id, source, purchase_date;
	`

	rows, err := r.db.Query(ctx, query, queryArgs...)
	if err != nil {
		return nil, fmt.Errorf("error inserting carbon offset: %w", err)
	}
	defer rows.Close()

	carbonOffset, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[models.CarbonOffset])
	if err != nil {
		return nil, fmt.Errorf("error retrieving inserted carbon offset: %w", err)
	}

	return &carbonOffset, nil
}

func (r *OffsetRepository) BatchCreateCarbonOffsets(ctx context.Context, req models.BatchCreateCarbonOffsetsRequest) ([]models.CarbonOffset, error) {
	columns := []string{"carbon_amount_kg", "company_id", "source", "purchase_date"}
	var (
		queryArgs []any
		valueRows []string
		argIndex  = 1
	)

	for _, offset := range req.CarbonOffsets {
		valuePlaceholders := []string{}
		queryArgs = append(queryArgs, offset.CarbonAmountKg, offset.CompanyID, offset.Source, offset.PurchaseDate)

		for i := 0; i < len(columns); i++ {
			valuePlaceholders = append(valuePlaceholders, fmt.Sprintf("$%d", argIndex))
			argIndex++
		}

		valueRows = append(valueRows, "("+strings.Join(valuePlaceholders, ", ")+")")
	}

	query := `
		INSERT INTO carbon_offset
		(` + strings.Join(columns, ", ") + `)
		VALUES ` + strings.Join(valueRows, ", ") + `
		RETURNING id, carbon_amount_kg, company_id, source, purchase_date;
	`

	rows, err := r.db.Query(ctx, query, queryArgs...)
	if err != nil {
		return nil, fmt.Errorf("error batch inserting carbon offsets: %w", err)
	}
	defer rows.Close()

	carbonOffsets, err := pgx.CollectRows(rows, pgx.RowToStructByName[models.CarbonOffset])
	if err != nil {
		return nil, fmt.Errorf("error collecting inserted carbon offsets: %w", err)
	}

	return carbonOffsets, nil
}

func NewOffsetRepository(db *pgxpool.Pool) *OffsetRepository {
	return &OffsetRepository{
		db,
	}
}
