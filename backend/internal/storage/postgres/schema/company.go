package schema

import (
	"arenius/internal/errs"
	"arenius/internal/models"
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type CompanyRepository struct {
	db *pgxpool.Pool
}

func (r *CompanyRepository) GetCompanyByXeroTenantID(ctx context.Context, xeroTenantID string) (*models.Company, error) {
	query := `
		SELECT id, name, xero_tenant_id, last_import_time
		FROM company 
		WHERE xero_tenant_id=$1
		LIMIT 1
	`
	var company models.Company

	err := r.db.QueryRow(ctx, query, xeroTenantID).Scan(
		&company.ID, &company.Name, &company.XeroTenantID, &company.LastImportTime,
	)
	if err != nil {
		return nil, errs.BadRequest(fmt.Sprintf("Error finding company with Xero Tenant ID: %s, %s", xeroTenantID, err))
	}
	return &company, nil
}

func (r *CompanyRepository) UpdateCompanyLastImportTime(ctx context.Context, id string) (*models.Company, error) {
	query := `
		UPDATE company
		SET last_import_time=$1
		WHERE id=$2
		RETURNING id, name, xero_tenant_id, last_import_time;
	`
	var company models.Company

	err := r.db.QueryRow(ctx, query, time.Now().UTC(), id).Scan(
		&company.ID, &company.Name, &company.XeroTenantID, &company.LastImportTime,
	)
	if err != nil {
		return nil, errs.BadRequest(fmt.Sprintf("Unable to update company last_import_time: %s", err))
	}
	return &company, nil
}

func (r *CompanyRepository) GetOrCreateCompany(ctx context.Context, xeroTenantID string, companyName string) (string, error) {
	const query = `
		INSERT INTO company (id, name, xero_tenant_id, last_import_time)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (xero_tenant_id) DO UPDATE SET xero_tenant_id = EXCLUDED.xero_tenant_id
		RETURNING id;
	`

	companyID := uuid.New().String()
	var existingCompanyID string
	err := r.db.QueryRow(ctx, query, companyID, companyName, xeroTenantID, time.Now()).Scan(&existingCompanyID)
	if err != nil {
		return "", fmt.Errorf("error inserting or retrieving company: %w", err)
	}

	return existingCompanyID, nil
}

func NewCompanyRepository(db *pgxpool.Pool) *CompanyRepository {
	return &CompanyRepository{
		db,
	}
}
