package schema

import (
	"arenius/internal/models"
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type CredentialsRepository struct {
	db *pgxpool.Pool
}

func (c *CredentialsRepository) GetCredentials(ctx context.Context) (models.XeroCredentials, error) {
	var query = `SELECT x.company_id, x.access_token, x.refresh_token, x.tenant_id FROM xero_credentials x`

	rows, err := c.db.Query(ctx, query)
	if err != nil {
		return models.XeroCredentials{}, err
	}
	defer rows.Close()

	credentialsList, err := pgx.CollectRows(rows, pgx.RowToStructByName[models.XeroCredentials])
	if err != nil {
		return models.XeroCredentials{}, err
	}

	if len(credentialsList) == 0 {
		return models.XeroCredentials{}, errors.New("no credentials found")
	}

	return credentialsList[len(credentialsList)-1], nil
}

func (c *CredentialsRepository) CreateCredentials(ctx context.Context, p models.XeroCredentials) (models.XeroCredentials, error) {
	// Log the values being inserted for debugging purposes
	fmt.Printf("Inserting credentials: ID=%v, AccessToken=%v, RefreshToken=%v, TenantID=%v\n", p.CompanyID, p.AccessToken, p.RefreshToken, p.TenantID)

	// Prepare the query
	query := `INSERT INTO xero_credentials (company_id, access_token, refresh_token, tenant_id)
				VALUES ($1, $2, $3, $4)`

	// Execute the query using Exec method
	res, err := c.db.Exec(ctx, query, p.CompanyID, p.AccessToken, p.RefreshToken, p.TenantID)
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

func NewCredentialsRepository(db *pgxpool.Pool) *CredentialsRepository {
	return &CredentialsRepository{
		db,
	}
}
