package schema

import (
	"arenius/internal/models"
	"arenius/internal/service/utils"
	"context"
	"github.com/jackc/pgx/v5/pgxpool"
)

type LineItemRepository struct {
	db *pgxpool.Pool
}

func (r *LineItemRepository) GetLineItems(ctx context.Context, pagination utils.Pagination) ([]models.LineItem, error) {
	query := `
		SELECT id, xero_line_item_id, description, quantity, unit_amount, company_id, contact_id, date, currency_code, emission_factor, amount, unit, co2, scope
		FROM line_item
		ORDER BY id
		LIMIT $1 OFFSET $2`

	offset := pagination.GetOffset()
	rows, err := r.db.Query(ctx, query, pagination.Limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lineItems []models.LineItem
	for rows.Next() {
		var lineItem models.LineItem
		if err := rows.Scan(&lineItem.ID, &lineItem.XeroLineItemID, &lineItem.Description, &lineItem.Quantity, &lineItem.UnitAmount, &lineItem.CompanyID, &lineItem.ContactID, &lineItem.Date, &lineItem.CurrencyCode, &lineItem.EmissionFactor, &lineItem.Amount, &lineItem.Unit, &lineItem.CO2, &lineItem.Scope); err != nil {
			return nil, err
		}
		lineItems = append(lineItems, lineItem)
	}

	return lineItems, nil
}

func NewLineItemRepository(db *pgxpool.Pool) *LineItemRepository {
	return &LineItemRepository{
		db,
	}
}
