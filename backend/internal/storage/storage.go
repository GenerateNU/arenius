package storage

import (
	"arenius/internal/models"
	"arenius/internal/service/utils"
	"arenius/internal/storage/postgres/schema"
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Interfaces for repository layer.
type TransactionRepository interface {
	CreateTransaction(ctx context.Context, transaction models.Transaction) (models.Transaction, error)
}

type LineItemRepository interface {
	GetLineItems(ctx context.Context, pagination utils.Pagination) ([]models.LineItem, error)
	ReconcileLineItem(ctx context.Context, lineItemId int, req models.ReconcileLineItemRequest) (*models.LineItem, error)
	AddLineItemEmissions(ctx context.Context, req models.LineItemEmissionsRequest) (*models.LineItem, error)
}

type EmissionsFactorRepository interface {
	AddEmissionsFactors(ctx context.Context, emissionFactor []models.EmissionsFactor) ([]models.EmissionsFactor, error)
}

type Repository struct {
	db              *pgxpool.Pool
	Transaction     TransactionRepository
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
		Transaction:     schema.NewTransactionRepository(db),
		LineItem:        schema.NewLineItemRepository(db),
		EmissionsFactor: schema.NewEmissionsFactorRepository(db),
	}
}
