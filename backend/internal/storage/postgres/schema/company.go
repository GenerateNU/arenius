package schema

import (
	"arenius/internal/errs"
	"arenius/internal/models"
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type CompanyRepository struct {
	db *pgxpool.Pool
}

func (r *CompanyRepository) GetCompanyByXeroTenantID(ctx context.Context, xeroTenantID string) (*models.Company, error) {
	query := `
		SELECT id, name, xero_tenant_id, last_transaction_import_time, last_contact_import_time
		FROM company 
		WHERE xero_tenant_id=$1
		LIMIT 1
	`
	companyRows, err := r.db.Query(ctx, query, xeroTenantID)
	if err != nil {
		return nil, err
	}
	defer companyRows.Close()

	company, err := pgx.CollectOneRow(companyRows, pgx.RowToStructByName[models.Company])

	if err != nil {
		return nil, errs.BadRequest(fmt.Sprintf("Error finding company with Xero Tenant ID: %s, %s", xeroTenantID, err))
	}
	return &company, nil
}

func (r *CompanyRepository) UpdateCompanyLastTransactionImportTime(ctx context.Context, id string) (*models.Company, error) {
	query := `
		UPDATE company
		SET last_transaction_import_time=$1
		WHERE id=$2
		RETURNING id, name, xero_tenant_id, last_transaction_import_time, last_contact_import_time;
	`
	companyRows, err := r.db.Query(ctx, query, time.Now().UTC(), id)
	if err != nil {
		return nil, err
	}
	defer companyRows.Close()

	company, err := pgx.CollectOneRow(companyRows, pgx.RowToStructByName[models.Company])

	if err != nil {
		return nil, errs.BadRequest(fmt.Sprintf("Unable to update company last_transaction_import_time: %s", err))
	}
	return &company, nil
}

func (r *CompanyRepository) UpdateCompanyLastContactImportTime(ctx context.Context, id string) (*models.Company, error) {
	query := `
		UPDATE company
		SET last_contact_import_time=$1
		WHERE id=$2
		RETURNING id, name, xero_tenant_id, last_transaction_import_time, last_contact_import_time;
	`
	companyRows, err := r.db.Query(ctx, query, time.Now().UTC(), id)
	if err != nil {
		return nil, err
	}
	defer companyRows.Close()

	company, err := pgx.CollectOneRow(companyRows, pgx.RowToStructByName[models.Company])

	if err != nil {
		return nil, errs.BadRequest(fmt.Sprintf("Unable to update company last_contact_import_time: %s", err))
	}
	return &company, nil
}

func (r *CompanyRepository) GetOrCreateCompany(ctx context.Context, xeroTenantID string, companyName string) (string, error) {
	// First, try to get the company ID for the provided xeroTenantID
	var companyID string
	query := `SELECT id FROM company WHERE xero_tenant_id = $1`
	err := r.db.QueryRow(ctx, query, xeroTenantID).Scan(&companyID)
	if err == nil {
		// If the company exists, return the existing company ID
		return companyID, nil
	}

	// If there was an error (i.e., no company found), we create a new company and set the credentials
	if err.Error() == "no rows in result set" {
		// Generate a new UUID for the company
		companyID = uuid.New().String()

		// Insert a new company record
		const insertQuery = `INSERT INTO company (id, name, xero_tenant_id, last_transaction_import_time) 
						VALUES ($1, $2, $3, $4)`
		_, err := r.db.Exec(ctx, insertQuery, companyID, companyName, xeroTenantID, time.Now())
		if err != nil {
			return "", fmt.Errorf("error creating company: %w", err)
		}

		// Return the newly created company ID
		return companyID, nil
	}

	// In case of any other error, return an error
	return "", fmt.Errorf("error checking company: %w", err)
}

func (r *CompanyRepository) GetTenantByTenantID(ctx context.Context, xeroTenantID string) (*models.Tenant, error) {
	query := `
		SELECT company.id, company.name, company.xero_tenant_id, company.last_transaction_import_time, company.last_contact_import_time, user_creds.refresh_token, user_creds.id as user_id
		FROM company JOIN user_creds ON company.xero_tenant_id = user_creds.tenant_id
		WHERE company.xero_tenant_id=$1
		LIMIT 1
	`

	tenantRows, err := r.db.Query(ctx, query, xeroTenantID)
	if err != nil {
		return nil, err
	}
	defer tenantRows.Close()

	tenant, err := pgx.CollectOneRow(tenantRows, pgx.RowToStructByName[models.Tenant])

	if err != nil {
		return nil, errs.BadRequest(fmt.Sprintf("Error finding company with Xero Tenant ID: %s, %s", xeroTenantID, err))
	}
	return &tenant, nil
}

func (r *CompanyRepository) GetAllTenants(ctx context.Context) ([]models.Tenant, error) {
	query := `
		SELECT DISTINCT ON (company.xero_tenant_id) 
		company.id, 
		company.name, 
		company.xero_tenant_id, 
		company.last_transaction_import_time, 
		company.last_contact_import_time, 
		user_creds.refresh_token, 
		user_creds.id AS user_id
		FROM company
		JOIN user_creds ON company.xero_tenant_id = user_creds.tenant_id
	`
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	tenants, err := pgx.CollectRows(rows, pgx.RowToStructByName[models.Tenant])
	if err != nil {
		return nil, fmt.Errorf("error collecting tenants: %w", err)
	}

	return tenants, nil
}

func NewCompanyRepository(db *pgxpool.Pool) *CompanyRepository {
	return &CompanyRepository{
		db,
	}
}
