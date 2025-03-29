package schema

import (
	"arenius/internal/models"
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type UserRepository struct {
	db *pgxpool.Pool
}

func (c *UserRepository) GetCredentialsByUserID(ctx context.Context, userID string) (models.XeroCredentials, error) {
	const query = `SELECT company_id, refresh_token, tenant_id 
                   FROM public.user_creds 
                   WHERE id = $1`

	// Query the database using the user ID
	row, err := c.db.Query(ctx, query, userID)
	if err != nil {
		return models.XeroCredentials{}, err
	}
	defer row.Close()
	credentials, err := pgx.CollectOneRow(row, pgx.RowToStructByName[models.XeroCredentials])
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
	const query = `Insert into public.user_creds (id, first_name, last_name) Values ($1, $2, $3)RETURNING id, first_name, last_name;
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
			id, company_id, refresh_token, tenant_id
		)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (id)
		DO UPDATE SET
			company_id = EXCLUDED.company_id,
			refresh_token = EXCLUDED.refresh_token,
			tenant_id = EXCLUDED.tenant_id
			RETURNING id;
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

func (c *UserRepository) GetUserbyRefreshToken(ctx context.Context, refreshToken string) (userId, companyId, tenantId string, e error) {
	const query = `SELECT id, company_id, tenant_id 
                   FROM public.user_creds 
                   WHERE refresh_token = $1`

	// Query the database using the user_id
	row := c.db.QueryRow(ctx, query, refreshToken)

	var user models.User
	err := row.Scan(&user.ID, &user.CompanyID, &user.TenantID)
	if err != nil {
		if err == pgx.ErrNoRows {
			return "", "", "", errors.New("no user found")
		}
		return "", "", "", err
	}

	// Return the credentials found for the user
	return user.ID, *user.CompanyID, *user.TenantID, nil
}

func (c *UserRepository) GetUserProfile(ctx context.Context, userId string) (*models.User, error) {

	const query = `
		SELECT id, first_name, last_name, company_id, refresh_token, tenant_id, city, state, photo_url
		FROM user_creds
		WHERE id = $1
		LIMIT 1
	`

	rows, err := c.db.Query(ctx, query, userId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	user, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[models.User])

	if err != nil {
		return nil, fmt.Errorf("error querying database for user: %w", err)
	}

	return &user, nil

}

func (c *UserRepository) UpdateUserProfile(ctx context.Context, userId string, req models.UpdateUserProfileRequest) (*models.User, error) {

	query := `UPDATE user_creds SET`
	updates := []string{}
	args := []interface{}{}
	argCount := 1

	if req.FirstName != nil {
		updates = append(updates, fmt.Sprintf("first_name = $%d", argCount))
		args = append(args, *req.FirstName)
		argCount++
	}
	if req.LastName != nil {
		updates = append(updates, fmt.Sprintf("last_name = $%d", argCount))
		args = append(args, *req.LastName)
		argCount++
	}
	if req.City != nil {
		updates = append(updates, fmt.Sprintf("city = $%d", argCount))
		args = append(args, *req.City)
		argCount++
	}
	if req.State != nil {
		updates = append(updates, fmt.Sprintf("state = $%d", argCount))
		args = append(args, *req.State)
		argCount++
	}
	if req.PhotoUrl != nil {
		updates = append(updates, fmt.Sprintf("photo_url = $%d", argCount))
		args = append(args, *req.PhotoUrl)
		argCount++
	}

	if len(updates) == 0 {
		return nil, fmt.Errorf("no fields to update")
	}

	query += " " + strings.Join(updates, ", ")
	query += fmt.Sprintf(" WHERE id = $%d", argCount)
	args = append(args, userId)

	query += " RETURNING id, first_name, last_name, company_id, refresh_token, tenant_id, city, state, photo_url"

	rows, err := c.db.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	user, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[models.User])

	if err != nil {
		return nil, fmt.Errorf("error querying database for user: %w", err)
	}

	return &user, nil

}

func (c *UserRepository) DeleteUser(ctx context.Context, userId string) (string, error) {
	const query = `DELETE FROM user_creds WHERE id = $1`
	_, err := c.db.Exec(ctx, query, userId)
	if err != nil {
		return "", fmt.Errorf("error querying database for user: %w", err)
	}
	return "User Deleted Successfully", nil
}

func NewUserRepository(db *pgxpool.Pool) *UserRepository {
	return &UserRepository{
		db,
	}
}
