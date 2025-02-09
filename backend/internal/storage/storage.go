package storage

import (
	"arenius/internal/models"
	"arenius/internal/service/utils"
	"arenius/internal/storage/postgres/schema"
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Interfaces for repository layer.
type LineItemRepository interface {
	GetLineItems(ctx context.Context, pagination utils.Pagination, filterParams models.GetLineItemsRequest) ([]models.LineItem, error)
	ReconcileLineItem(ctx context.Context, lineItemId int, req models.ReconcileLineItemRequest) (*models.LineItem, error)
	AddLineItemEmissions(ctx context.Context, req models.LineItemEmissionsRequest) (*models.LineItem, error)
	CreateLineItem(ctx context.Context, req models.CreateLineItemRequest) (*models.LineItem, error)
	AddImportedLineItems(ctx context.Context, req []models.AddImportedLineItemRequest) ([]models.LineItem, error)
}

type EmissionsFactorRepository interface {
	AddEmissionsFactors(ctx context.Context, emissionFactor []models.EmissionsFactor) ([]models.EmissionsFactor, error)
	GetEmissionFactors(ctx context.Context) ([]models.Category, error)
}

type SummaryRepository interface {
	GetGrossSummary(ctx context.Context, req models.GetGrossSummaryRequest) (*models.GetGrossSummaryResponse, error)
}

type CredentialsRepository interface {
	GetCredentials(ctx context.Context) (models.XeroCredentials, error)
	CreateCredentials(ctx context.Context, p models.XeroCredentials) (models.XeroCredentials, error)
}

type CompanyRepository interface {
	GetCompanyByXeroTenantID(ctx context.Context, xeroTenantID string) (*models.Company, error)
	UpdateCompanyLastImportTime(ctx context.Context, id string) (*models.Company, error)
	GetOrCreateCompany(ctx context.Context, xeroTenantID string, companyName string) (string, error)
}

type Repository struct {
	db              *pgxpool.Pool
	LineItem        LineItemRepository
	EmissionsFactor EmissionsFactorRepository
	Summary         SummaryRepository
	Credentials     CredentialsRepository
	Company         CompanyRepository
}

func (r *Repository) Close() error {
	r.db.Close()
	return nil
}

func (r *Repository) GetDB() *pgxpool.Pool {
	return r.db
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{
		db:              db,
		LineItem:        schema.NewLineItemRepository(db),
		EmissionsFactor: schema.NewEmissionsFactorRepository(db),
		Summary:         schema.NewSummaryRepository(db),
		Credentials:     schema.NewCredentialsRepository(db),
		Company:         schema.NewCompanyRepository(db),
	}
}
