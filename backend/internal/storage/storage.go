package storage

import (
	"arenius/internal/models"
	"arenius/internal/service/utils"
	"arenius/internal/storage/postgres/schema"
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Interfaces for repository layer.
type LineItemRepository interface {
	GetLineItems(ctx context.Context, pagination utils.Pagination, filterParams models.GetLineItemsRequest) ([]models.LineItemWithDetails, error)
	ReconcileLineItem(ctx context.Context, lineItemId string, req models.ReconcileLineItemRequest) (*models.LineItem, error)
	AddLineItemEmissions(ctx context.Context, req models.LineItemEmissionsRequest) (*models.LineItem, error)
	CreateLineItem(ctx context.Context, req models.CreateLineItemRequest) (*models.LineItem, error)
	AddImportedLineItems(ctx context.Context, req []models.AddImportedLineItemRequest) ([]models.LineItem, error)
	BatchUpdateScopeEmissions(ctx context.Context, lineItems []uuid.UUID, scope *int, emissionsFactorID *string) error
	BatchUpdateScopeEmissions(ctx context.Context, lineItems []uuid.UUID, scope *int, emissionsFactorID *string) error
}

type EmissionsFactorRepository interface {
	AddEmissionsFactors(ctx context.Context, emissionFactor []models.EmissionsFactor) ([]models.EmissionsFactor, error)
	GetEmissionFactors(ctx context.Context) ([]models.Category, error)
}

type SummaryRepository interface {
	GetGrossSummary(ctx context.Context, req models.GetGrossSummaryRequest) (*models.GetGrossSummaryResponse, error)
}

type UserRepository interface {
	GetCredentialsByUserID(ctx context.Context, userID string) (models.XeroCredentials, error)
	AddUser(ctx context.Context, userId string, firstName *string, lastName *string) (*models.User, error)
	SetUserCredentials(ctx context.Context, userID string, companyID string, refreshToken string, tenantID string) error
	GetUserByTenantID(ctx context.Context, tenantID string) (*models.User, error)
	GetAllTenants(ctx context.Context) ([]models.User, error)
}

type CompanyRepository interface {
	GetCompanyByXeroTenantID(ctx context.Context, xeroTenantID string) (*models.Company, error)
	UpdateCompanyLastTransactionImportTime(ctx context.Context, id string) (*models.Company, error)
	UpdateCompanyLastContactImportTime(ctx context.Context, id string) (*models.Company, error)
	GetOrCreateCompany(ctx context.Context, xeroTenantID string, companyName string) (string, error)
	GetAllTenants(ctx context.Context) ([]models.Tenant, error)
	GetTenantByTenantID(ctx context.Context, tenantID string) (*models.Tenant, error)
}

type ContactRepository interface {
	GetContacts(ctx context.Context, pagination utils.Pagination, companyId string) ([]models.Contact, error)
	CreateContact(ctx context.Context, req models.CreateContactRequest) (*models.Contact, error)
	AddImportedContacts(ctx context.Context, req []models.AddImportedContactRequest) ([]models.Contact, error)
}

type OffsetRepository interface {
	PostCarbonOffset(ctx context.Context, p models.CarbonOffset) (models.CarbonOffset, error)
}

type Repository struct {
	db              *pgxpool.Pool
	LineItem        LineItemRepository
	EmissionsFactor EmissionsFactorRepository
	Summary         SummaryRepository
	User            UserRepository
	User            UserRepository
	Company         CompanyRepository
	Offset          OffsetRepository
	Contact         ContactRepository
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
		User:            schema.NewUserRepository(db),
		User:            schema.NewUserRepository(db),
		Company:         schema.NewCompanyRepository(db),
		Offset:          schema.NewOffsetRepository(db),
		Contact:         schema.NewContactRepository(db),
	}
}
