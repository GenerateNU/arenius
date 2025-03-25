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
	columns := []string{"id", "carbon_amount_kg", "company_id", "source", "purchase_date"}
	queryArgs := []any{
		req.ID,
		req.CarbonAmountKg,
		req.CompanyID,
		req.Source,
		req.PurchaseDate,
	}

	var numInputs []string
	for i := 1; i <= len(columns); i++ {
		numInputs = append(numInputs, fmt.Sprintf("$%d", i))
	}

	query := `
		INSERT INTO carbon_offset
		(` + strings.Join(columns, ", ") + `)
		VALUES (` + strings.Join(numInputs, ", ") + `)
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

func NewOffsetRepository(db *pgxpool.Pool) *OffsetRepository {
	return &OffsetRepository{
		db,
	}
}
