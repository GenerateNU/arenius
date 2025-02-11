package schema

import (
	"arenius/internal/models"
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type CredentialsRepository struct {
	db *pgxpool.Pool
}

func (c *CredentialsRepository) GetCredentialsByUserID(ctx context.Context, userID string) (models.XeroCredentials, error) {
	const query = `SELECT company_id, access_token, refresh_token, tenant_id 
                   FROM public.user_credentials 
                   WHERE id = $1`

	// Query the database using the user_id
	row := c.db.QueryRow(ctx, query, userID)

	var credentials models.XeroCredentials
	err := row.Scan(&credentials.CompanyID, &credentials.AccessToken, &credentials.RefreshToken, &credentials.TenantID)
	if err != nil {
		if err == pgx.ErrNoRows {
			return models.XeroCredentials{}, errors.New("no credentials found for the given user")
		}
		return models.XeroCredentials{}, err
	}

	// Return the credentials found for the user
	return credentials, nil
}

func NewCredentialsRepository(db *pgxpool.Pool) *CredentialsRepository {
	return &CredentialsRepository{
		db,
	}
}
