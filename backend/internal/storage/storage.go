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
}

type EmissionsFactorRepository interface {
	AddEmissionsFactors(ctx context.Context, emissionFactor []models.EmissionsFactor) ([]models.EmissionsFactor, error)
}

type Repository struct {
	db              *pgxpool.Pool
	LineItem        LineItemRepository
	EmissionsFactor EmissionsFactorRepository
}

func (r *Repository) Close() error {
	r.db.Close()
	return nil
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{
		db:              db,
		LineItem:        schema.NewLineItemRepository(db),
		EmissionsFactor: schema.NewEmissionsFactorRepository(db),
	}
}
