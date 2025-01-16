package storage

import (
	"arenius/internal/models"
	"arenius/internal/storage/postgres/schema"
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Interfaces for repository layer.
type TransactionRepository interface {
	CreateTransaction(ctx context.Context, transaction models.Transaction) (models.Transaction, error)
	ConvertTransactions(ctx context.Context, transactions []models.Transaction) ([]models.Transaction, error)
}

type Repository struct {
	db          *pgxpool.Pool
	Transaction TransactionRepository
}

func (r *Repository) Close() error {
	r.db.Close()
	return nil
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{
		db:          db,
		Transaction: schema.NewTransactionRepository(db),
	}
}
