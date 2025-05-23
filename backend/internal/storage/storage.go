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
	GetLineItems(ctx context.Context, pagination utils.Pagination, filterParams models.GetLineItemsRequest) (*models.GetLineItemsResponse, error)
	ReconcileLineItem(ctx context.Context, lineItemId string, scope int, emissionsFactorId string, contactID *string, co2 *float64, co2Unit *string) (*models.LineItem, error)
	AddLineItemEmissions(ctx context.Context, req models.LineItemEmissionsRequest) (*models.LineItem, error)
	CreateLineItem(ctx context.Context, req models.CreateLineItemRequest) (*models.LineItem, error)
	AddImportedLineItems(ctx context.Context, req []models.AddImportedLineItemRequest) ([]models.LineItem, error)
	BatchUpdateLineItems(ctx context.Context, lineItems []uuid.UUID, scope *int, emissionsFactorID *string, co2 *float64, co2Unit *string) error
	GetLineItemsByIds(ctx context.Context, lineItemIDs []uuid.UUID) ([]models.LineItem, error)
	AutoReconcileLineItems(ctx context.Context, companyId uuid.UUID) ([]models.LineItem, error)
	HandleRecommendation(ctx context.Context, lineItemId uuid.UUID, accept bool) (*models.LineItem, error)
	Checkpoint(ctx context.Context, companyId uuid.UUID) error
}

type EmissionsFactorRepository interface {
	AddEmissionsFactors(ctx context.Context, emissionFactor []models.EmissionsFactor) ([]models.EmissionsFactor, error)
	GetEmissionFactors(ctx context.Context, companyId string, searchTerm string) (*models.Categories, error)
	PostFavoriteEmissionFactors(ctx context.Context, companyId string, emissionFactorId string, setFavorite bool) error
}

type SummaryRepository interface {
	GetEmissionSummary(ctx context.Context, req models.GetSummaryRequest) (*models.GetSummaryResponse, error)
	GetContactEmissions(ctx context.Context, req models.GetSummaryRequest) (*models.GetContactEmissionsSummaryResponse, error)
	GetScopeBreakdown(ctx context.Context, req models.GetSummaryRequest) ([]models.NetSummary, error)
	GetTopEmissions(ctx context.Context, req models.GetSummaryRequest) (*[]models.GetTopEmissionsResponse, error)
}

type UserRepository interface {
	GetCredentialsByUserID(ctx context.Context, userID string) (models.XeroCredentials, error)
	AddUser(ctx context.Context, userId string, firstName *string, lastName *string) (*models.User, error)
	SetUserCredentials(ctx context.Context, userID string, companyID string, refreshToken string, tenantID string) error
	GetUserbyRefreshToken(ctx context.Context, refreshToken string) (userId, companyId, tenantId string, e error)
	GetUserProfile(ctx context.Context, userID string) (*models.User, error)
	UpdateUserProfile(ctx context.Context, userID string, req models.UpdateUserProfileRequest) (*models.User, error)
	DeleteUser(ctx context.Context, userID string) (string, error)
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
	GetContact(ctx context.Context, contactId string) (*models.ContactWithDetails, error)
	GetContacts(ctx context.Context, pagination utils.Pagination, filterParams models.GetContactsRequest, companyId string) (*models.GetContactsResponse, error)
	CreateContact(ctx context.Context, req models.CreateContactRequest) (*models.Contact, error)
	AddImportedContacts(ctx context.Context, req []models.AddImportedContactRequest) ([]models.Contact, error)
	GetOrCreateXeroContact(ctx context.Context, xeroContactID, name, email, phone, city, state string, companyID string) (string, error)
	UpdateContact(ctx context.Context, contactId string, req models.UpdateContactRequest) (*models.Contact, error)
}

type OffsetRepository interface {
	GetCarbonOffsets(ctx context.Context, pagination utils.Pagination, filterParams models.GetCarbonOffsetsRequest) ([]models.CarbonOffset, error)
	CreateCarbonOffset(ctx context.Context, p models.CreateCarbonOffsetRequest) (*models.CarbonOffset, error)
	BatchCreateCarbonOffsets(ctx context.Context, req models.BatchCreateCarbonOffsetsRequest) ([]models.CarbonOffset, error)
}

type Repository struct {
	db              *pgxpool.Pool
	LineItem        LineItemRepository
	EmissionsFactor EmissionsFactorRepository
	Summary         SummaryRepository
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
		Company:         schema.NewCompanyRepository(db),
		Offset:          schema.NewOffsetRepository(db),
		Contact:         schema.NewContactRepository(db),
	}
}
