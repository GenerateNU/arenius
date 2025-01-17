package schema

import (
	"arenius/internal/models"
	"arenius/internal/service/utils"
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type LineItemRepository struct {
	db *pgxpool.Pool
}

func (r *LineItemRepository) GetLineItems(ctx context.Context, pagination utils.Pagination) ([]models.LineItem, error) {
	query := `
		SELECT id, xero_line_item_id, description, quantity, unit_amount, company_id, contact_id, date, currency_code, emission_factor, amount, unit, co2, scope
		FROM line_item
		ORDER BY date
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

func(r *LineItemRepository) ReconcileLineItem(ctx context.Context, lineItemId int, req models.ReconcileLineItemRequest) (*models.LineItem, error) {

	query := `
		UPDATE line_item
		SET emission_factor = $1,
		    amount = $2,
			unit = $3
		WHERE id = $4
		RETURNING *
	`
	var lineItem models.LineItem
	err := r.db.QueryRow(ctx, query, req.EmissionsFactor, req.Amount, req.Unit, lineItemId).Scan(&lineItem.ID, &lineItem.XeroLineItemID, &lineItem.Description, &lineItem.Quantity, &lineItem.UnitAmount, &lineItem.CompanyID, &lineItem.ContactID, &lineItem.Date, &lineItem.CurrencyCode, &lineItem.EmissionFactor, &lineItem.Amount, &lineItem.Unit, &lineItem.CO2, &lineItem.Scope)

	if err != nil {
		return nil, fmt.Errorf("error querying database: %w", err) 
	}

	return &lineItem, nil

}

func NewLineItemRepository(db *pgxpool.Pool) *LineItemRepository {
	return &LineItemRepository{
		db,
	}
}
