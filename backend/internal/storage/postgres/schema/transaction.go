package schema

import (
	"arenius/internal/models"
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type TransactionRepository struct {
	db *pgxpool.Pool
}

func (r *TransactionRepository) CreateTransaction(ctx context.Context, transaction models.Transaction) (models.Transaction, error) {
	query := `
		INSERT INTO transaction (company_id, bank_transaction_id, contact_id, sub_total, total_tax, total, currency_code, created_at, imported_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`

	_, err := r.db.Exec(ctx, query, transaction.CompanyID, transaction.BankTransactionID, transaction.ContactID, transaction.SubTotal, transaction.TotalTax, transaction.Total, transaction.CurrencyCode, transaction.CreatedAt, transaction.ImportedAt)
	if err != nil {
		return models.Transaction{}, err
	}

	return transaction, nil
}

func NewTransactionRepository(db *pgxpool.Pool) *TransactionRepository {
	return &TransactionRepository{
		db,
	}
}
