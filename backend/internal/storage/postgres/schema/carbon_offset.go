package schema

import (
	"arenius/internal/models"
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type OffsetRepository struct {
	db *pgxpool.Pool
}

func (c *OffsetRepository) PostCarbonOffset(ctx context.Context, p models.CarbonOffset) (models.CarbonOffset, error) {
	// Prepare the query
	const query = `INSERT INTO carbon_offset (id, carbon_amount_kg, company_id, source, purchase_date)
				VALUES ($1, $2, $3, $4, $5)`

	// Execute the query using Exec method
	res, err := c.db.Exec(ctx, query, p.ID, p.CarbonAmountKg, p.CompanyID, p.Source, p.PurchaseDate)
	if err != nil {
		// Log the error if it occurs
		fmt.Printf("Error executing query: %v\n", err)
		return p, err
	}

	// Check how many rows were affected by the insert
	affectedRows := res.RowsAffected()
	fmt.Printf("Number of rows affected: %v\n", affectedRows)

	// If no rows were affected, log that
	if affectedRows == 0 {
		fmt.Println("No rows were inserted.")
	}

	return p, nil
}

func NewOffsetRepository(db *pgxpool.Pool) *OffsetRepository {
	return &OffsetRepository{
		db,
	}
}
