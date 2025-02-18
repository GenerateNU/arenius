package schema

import (
	"arenius/internal/models"
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type UserRepository struct {
	db *pgxpool.Pool
}

func (c *UserRepository) GetCredentialsByUserID(ctx context.Context, userID string) (models.XeroCredentials, error) {
	const query = `SELECT company_id, refresh_token, tenant_id 
                   FROM public.user_creds 
                   WHERE user_id = $1`

	// Query the database using the user_id
	row := c.db.QueryRow(ctx, query, userID)

	var credentials models.XeroCredentials
	err := row.Scan(&credentials.CompanyID, &credentials.RefreshToken, &credentials.TenantID)
	if err != nil {
		if err == pgx.ErrNoRows {
			return models.XeroCredentials{}, errors.New("no credentials found for the given user")
		}
		return models.XeroCredentials{}, err
	}

	// Return the credentials found for the user
	return credentials, nil
}

func (r *UserRepository) AddUser(ctx context.Context, userID string, firstName *string, lastName *string) (*models.User, error) {
	const query = `Insert into public.user_creds (user_id, first_name, last_name) Values ($1, $2, $3)RETURNING user_id, first_name, last_name;
	`
	var user models.User
	err := r.db.QueryRow(ctx, query, userID, firstName, lastName).Scan(
		&user.ID,
		&user.FirstName,
		&user.LastName)

	if err != nil {
		return nil, fmt.Errorf("error querying database: %w", err)
	}

	return &user, nil
}

func (r *UserRepository) SetUserCredentials(ctx context.Context, userID string, companyID string, refreshToken string, tenantID string) error {
	// Define your query
	const query = `
		INSERT INTO public.user_creds (
			user_id, company_id, refresh_token, tenant_id
		)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (user_id)
		DO UPDATE SET
			company_id = EXCLUDED.company_id,
			refresh_token = EXCLUDED.refresh_token,
			tenant_id = EXCLUDED.tenant_id
			RETURNING user_id;
	`

	var userCredentialsID string

	// Execute the query
	err := r.db.QueryRow(ctx, query, userID, companyID, refreshToken, tenantID).Scan(&userCredentialsID)
	if err != nil {
		fmt.Printf("Error inserting user credentials: %v\n", err)
		return fmt.Errorf("error inserting user credentials: %w", err)
	}

	return nil

}

func (r *UserRepository) GetAllTenants(ctx context.Context) ([]models.User, error) {
	const query = `SELECT DISTINCT ON (tenant_id) user_id, first_name, last_name, refresh_token, tenant_id FROM public.user_creds`

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("error querying database: %w", err)
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var user models.User
		if err := rows.Scan(&user.ID, &user.FirstName, &user.LastName, &user.RefreshToken, &user.TenantID); err != nil {
			return nil, fmt.Errorf("error scanning row: %w", err)
		}
		users = append(users, user)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating over rows: %w", err)
	}

	return users, nil
}

func (r *UserRepository) GetUserByTenantID(ctx context.Context, tenantID string) (*models.User, error) {
	const query = `SELECT user_id, first_name, last_name, refresh_token, tenant_id FROM public.user_creds WHERE tenant_id = $1 AND refresh_token IS NOT NULL LIMIT 1`

	row := r.db.QueryRow(ctx, query, tenantID)

	var user models.User
	err := row.Scan(&user.ID, &user.FirstName, &user.LastName, &user.RefreshToken, &user.TenantID)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, errors.New("no user found for the given tenant ID")
		}
		return nil, fmt.Errorf("error querying database: %w", err)
	}

	return &user, nil
}

func NewUserRepository(db *pgxpool.Pool) *UserRepository {
	return &UserRepository{
		db,
	}
}
