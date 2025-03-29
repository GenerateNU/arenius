package schema

import (
	"arenius/internal/models"
	"arenius/internal/service/utils"
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type OffsetRepository struct {
	db *pgxpool.Pool
}

func (r *OffsetRepository) GetCarbonOffsets(ctx context.Context, pagination utils.Pagination, filterParams models.GetCarbonOffsetsRequest) ([]models.CarbonOffset, error) {
	filterQuery := "WHERE 1=1"

	if filterParams.SearchTerm != nil {
		filterQuery += fmt.Sprintf(" AND (co.description ILIKE '%%%s%%')", *filterParams.SearchTerm)
	}

	filterColumns := []string{}
	filterArgs := []interface{}{}

	if filterParams.CompanyId != nil {
		filterColumns = append(filterColumns, "co.company_id=")
		filterArgs = append(filterArgs, *filterParams.CompanyId)
	}

	if filterParams.BeforeDate != nil {
		filterColumns = append(filterColumns, "co.purchase_date<=")
		filterArgs = append(filterArgs, filterParams.BeforeDate.UTC().Add(time.Hour*24))
	}

	if filterParams.AfterDate != nil {
		filterColumns = append(filterColumns, "co.purchase_date>=")
		filterArgs = append(filterArgs, filterParams.AfterDate.UTC())
	}

	for i := 0; i < len(filterColumns); i++ {
		filterQuery += fmt.Sprintf(" AND (%s$%d)", filterColumns[i], i+3)
	}

	query := `
		SELECT co.id, co.carbon_amount_kg, co.company_id, co.source, co.purchase_date
		FROM carbon_offset co ` + filterQuery + `
		ORDER BY co.purchase_date DESC
		LIMIT $1 OFFSET $2
	`

	queryArgs := append([]interface{}{pagination.Limit, pagination.GetOffset()}, filterArgs...)
	rows, err := r.db.Query(ctx, query, queryArgs...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	carbonOffsets, err := pgx.CollectRows(rows, pgx.RowToStructByName[models.CarbonOffset])
	if err != nil {
		return nil, err
	}

	return carbonOffsets, nil
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
