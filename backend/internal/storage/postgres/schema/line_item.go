package schema

import (
	"arenius/internal/errs"
	"arenius/internal/models"
	"arenius/internal/service/utils"
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type LineItemRepository struct {
	db *pgxpool.Pool
}

func (r *LineItemRepository) GetLineItems(ctx context.Context, pagination utils.Pagination) ([]models.LineItem, error) {
	query := `
		SELECT id, xero_line_item_id, description, quantity, unit_amount, company_id, contact_id, date, currency_code, emission_factor, amount, unit, co2, co2_unit, scope
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
		if err := rows.Scan(&lineItem.ID, &lineItem.XeroLineItemID, &lineItem.Description, &lineItem.Quantity, &lineItem.UnitAmount, &lineItem.CompanyID, &lineItem.ContactID, &lineItem.Date, &lineItem.CurrencyCode, &lineItem.EmissionFactor, &lineItem.Amount, &lineItem.Unit, &lineItem.CO2, &lineItem.CO2Unit, &lineItem.Scope); err != nil {
			return nil, err
		}
		lineItems = append(lineItems, lineItem)
	}

	return lineItems, nil
}

func (r *LineItemRepository) ReconcileLineItem(ctx context.Context, lineItemId int, req models.ReconcileLineItemRequest) (*models.LineItem, error) {

	query := `
		UPDATE line_item
		SET emission_factor = $1,
		    amount = $2,
			unit = $3
		WHERE id = $4
		RETURNING id, xero_line_item_id, description, quantity, unit_amount, company_id, contact_id, date, currency_code, emission_factor, amount, unit, co2, co2_unit, scope
	`
	var lineItem models.LineItem
	err := r.db.QueryRow(ctx, query, req.EmissionsFactor, req.Amount, req.Unit, lineItemId).Scan(&lineItem.ID, &lineItem.XeroLineItemID, &lineItem.Description, &lineItem.Quantity, &lineItem.UnitAmount, &lineItem.CompanyID, &lineItem.ContactID, &lineItem.Date, &lineItem.CurrencyCode, &lineItem.EmissionFactor, &lineItem.Amount, &lineItem.Unit, &lineItem.CO2, &lineItem.CO2Unit, &lineItem.Scope)

	if err != nil {
		return nil, fmt.Errorf("error querying database: %w", err)
	}

	return &lineItem, nil

}

func (r *LineItemRepository) AddLineItemEmissions(ctx context.Context, req models.LineItemEmissionsRequest) (*models.LineItem, error) {
	const query = `
		UPDATE line_item
		SET co2 = $1,
		    co2_unit = $2
		WHERE id = $3
		RETURNING id, xero_line_item_id, description, quantity, unit_amount, company_id, contact_id, date, currency_code, emission_factor, amount, unit, co2, co2_unit, scope
	`

	var lineItem models.LineItem
	err := r.db.QueryRow(ctx, query, req.CO2, req.CO2Unit, req.LineItemId).Scan(
		&lineItem.ID,
		&lineItem.XeroLineItemID,
		&lineItem.Description,
		&lineItem.Quantity,
		&lineItem.UnitAmount,
		&lineItem.CompanyID,
		&lineItem.ContactID,
		&lineItem.Date,
		&lineItem.CurrencyCode,
		&lineItem.EmissionFactor,
		&lineItem.Amount,
		&lineItem.Unit,
		&lineItem.CO2,
		&lineItem.CO2Unit,
		&lineItem.Scope)

	if err != nil {
		return nil, fmt.Errorf("error querying database: %w", err)
	}
	return &lineItem, nil

}

func (r *LineItemRepository) CreateLineItem(ctx context.Context, req models.CreateLineItemRequest) (*models.LineItem, error) {
	columns, queryArgs, validationErr := createLineItemValidations(req)

	if validationErr != nil {
		return nil, validationErr
	}

	var numInputs []string
	for i := 1; i <= len(columns); i++ {
		numInputs = append(numInputs, fmt.Sprintf("$%d", i))
	}

	query := `
		INSERT INTO line_item
		(` + strings.Join(columns, ", ") + `)
		VALUES (` + strings.Join(numInputs, ", ") + `)
		RETURNING *;
	`
	var lineItem models.LineItem
	err := r.db.QueryRow(ctx, query, queryArgs...).Scan(
		&lineItem.ID,
		&lineItem.XeroLineItemID,
		&lineItem.Description,
		&lineItem.Quantity,
		&lineItem.UnitAmount,
		&lineItem.CompanyID,
		&lineItem.ContactID,
		&lineItem.Date,
		&lineItem.CurrencyCode,
		&lineItem.EmissionFactor,
		&lineItem.Amount,
		&lineItem.Unit,
		&lineItem.CO2,
		&lineItem.CO2Unit,
		&lineItem.Scope)

	if err != nil {
		return nil, fmt.Errorf("error querying database: %w", err)
	}

	return &lineItem, nil

}

func createLineItemValidations(req models.CreateLineItemRequest) ([]string, []interface{}, error) {
	id := uuid.New().String()
	createdAt := time.Now().UTC()
	columns := []string{"id", "description", "quantity", "unit_amount", "company_id", "contact_id", "date", "currency_code"}
	// TODO: fix company id and currency code
	queryArgs := []interface{}{id, req.Description, req.Quantity, req.UnitAmount, req.CompanyID, req.ContactID, createdAt, "USD"}

	// validate values in existing columns
	if req.Quantity < 0 {
		return nil, nil, errs.BadRequest("Quantity must be >= 0")
	}
	if _, err := uuid.Parse(req.ContactID); err != nil {
		return nil, nil, errs.BadRequest("Contact ID must be a UUID")
	}
	if _, err := uuid.Parse(req.CompanyID); err != nil {
		return nil, nil, errs.BadRequest("Company ID must be a UUID")
	}
	if req.UnitAmount < 0 {
		return nil, nil, errs.BadRequest("Unit amount must be >= 0")
	}

	// only include the optional columns if they exist
	if req.EmissionFactor != nil {
		columns = append(columns, "emission_factor")
		queryArgs = append(queryArgs, *req.EmissionFactor)
	}
	if req.Amount != nil {
		columns = append(columns, "amount")
		queryArgs = append(queryArgs, *req.Amount)
		if *req.Amount < 0 {
			return nil, nil, errs.BadRequest("Amount must be >= 0")
		}
	}
	if req.Unit != nil {
		columns = append(columns, "unit")
		queryArgs = append(queryArgs, *req.Unit)
	}
	if req.CO2 != nil {
		columns = append(columns, "co2")
		queryArgs = append(queryArgs, *req.CO2)
		if *req.CO2 < 0 {
			return nil, nil, errs.BadRequest("CO2 must be >= 0")
		}
	}
	if req.CO2Unit != nil {
		columns = append(columns, "co2_unit")
		queryArgs = append(queryArgs, *req.CO2Unit)
	}
	if req.Scope != nil {
		columns = append(columns, "scope")
		queryArgs = append(queryArgs, *req.Scope)
	}

	return columns, queryArgs, nil
}

func NewLineItemRepository(db *pgxpool.Pool) *LineItemRepository {
	return &LineItemRepository{
		db,
	}
}
