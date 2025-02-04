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

func (r *LineItemRepository) GetLineItems(ctx context.Context, pagination utils.Pagination, filterParams models.GetLineItemsRequest) ([]models.LineItem, error) {
	filterQuery := "WHERE 1=1"

	if filterParams.ReconciliationStatus != nil {
		if *filterParams.ReconciliationStatus {
			filterQuery += " AND li.emission_factor_id IS NOT NULL"
		} else {
			filterQuery += " AND li.emission_factor_id IS NULL"
		}
	}

	filterColumns := []string{}
	filterArgs := []interface{}{}

	if filterParams.CompanyID != nil {
		filterColumns = append(filterColumns, "company_id")
		filterArgs = append(filterArgs, *filterParams.CompanyID)
	}
	if filterParams.Date != nil {
		filterColumns = append(filterColumns, "date")
		filterArgs = append(filterArgs, filterParams.Date.UTC())
	}

	for i := 0; i < len(filterColumns); i++ {
		filterQuery += fmt.Sprintf(" AND %s=$%d", filterColumns[i], i+3)
	}

	query := `
	SELECT li.id, li.xero_line_item_id, li.description, li.quantity, li.unit_amount, li.company_id, li.contact_id, li.date, li.currency_code, li.emission_factor_id, ef.name, li.co2, li.co2_unit, li.scope
	FROM line_item li LEFT JOIN emission_factor ef ON li.emission_factor_id = ef.activity_id ` + filterQuery + `
	ORDER BY li.date DESC
	LIMIT $1 OFFSET $2
	`

	queryArgs := append([]interface{}{pagination.Limit, pagination.GetOffset()}, filterArgs...)
	rows, err := r.db.Query(ctx, query, queryArgs...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lineItems []models.LineItem
	for rows.Next() {
		var lineItem models.LineItem
		if err := rows.Scan(
			&lineItem.ID,
			&lineItem.XeroLineItemID,
			&lineItem.Description,
			&lineItem.Quantity,
			&lineItem.UnitAmount,
			&lineItem.CompanyID,
			&lineItem.ContactID,
			&lineItem.Date,
			&lineItem.CurrencyCode,
			&lineItem.EmissionFactorId,
			&lineItem.EmissionFactorName,
			&lineItem.CO2,
			&lineItem.CO2Unit,
			&lineItem.Scope,
		); err != nil {
			return nil, err
		}
		lineItems = append(lineItems, lineItem)
	}

	return lineItems, nil
}

func (r *LineItemRepository) ReconcileLineItem(ctx context.Context, lineItemId int, req models.ReconcileLineItemRequest) (*models.LineItem, error) {

	query := `
		UPDATE line_item
		SET emission_factor_id = $1,
		    amount = $2,
			unit = $3
		WHERE id = $4
		RETURNING id, xero_line_item_id, description, quantity, unit_amount, company_id, contact_id, date, currency_code, emission_factor_id, co2, co2_unit, scope
	`
	var lineItem models.LineItem
	err := r.db.QueryRow(ctx, query, req.EmissionsFactor, req.Amount, req.Unit, lineItemId).Scan(&lineItem.ID, &lineItem.XeroLineItemID, &lineItem.Description, &lineItem.Quantity, &lineItem.UnitAmount, &lineItem.CompanyID, &lineItem.ContactID, &lineItem.Date, &lineItem.CurrencyCode, &lineItem.EmissionFactorId, &lineItem.CO2, &lineItem.CO2Unit, &lineItem.Scope)

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
		RETURNING id, xero_line_item_id, description, quantity, unit_amount, company_id, contact_id, date, currency_code, emission_factor_id, co2, co2_unit, scope
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
		&lineItem.EmissionFactorId,
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
		RETURNING id, xero_line_item_id, description, quantity, unit_amount, company_id, contact_id, date, currency_code, emission_factor_id, co2, co2_unit, scope;
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
		&lineItem.EmissionFactorId,
		&lineItem.CO2,
		&lineItem.CO2Unit,
		&lineItem.Scope)

	if err != nil {
		return nil, fmt.Errorf("error querying database: %w", err)
	}

	return &lineItem, nil

}

func (r *LineItemRepository) AddImportedLineItems(ctx context.Context, req []models.AddImportedLineItemRequest) ([]models.LineItem, error) {
	var createdLineItems []models.LineItem
	for _, importedLineItem := range req {
		query := `
			INSERT INTO line_item
			(id, xero_line_item_id, description, quantity, unit_amount, company_id, contact_id, date, currency_code)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
			RETURNING id, xero_line_item_id, description, quantity, unit_amount, company_id, contact_id, date, currency_code, emission_factor_id, co2, co2_unit, scope;
		`
		// TODO: handle duplicate based on xero_line_item_id
		var lineItem models.LineItem
		err := r.db.QueryRow(ctx, query,
			uuid.New().String(),
			importedLineItem.XeroLineItemID,
			importedLineItem.Description,
			importedLineItem.Quantity,
			importedLineItem.UnitAmount,
			importedLineItem.CompanyID,
			importedLineItem.ContactID,
			importedLineItem.Date.UTC(),
			importedLineItem.CurrencyCode).
			Scan(
				&lineItem.ID,
				&lineItem.XeroLineItemID,
				&lineItem.Description,
				&lineItem.Quantity,
				&lineItem.UnitAmount,
				&lineItem.CompanyID,
				&lineItem.ContactID,
				&lineItem.Date,
				&lineItem.CurrencyCode,
				&lineItem.EmissionFactorId,
				&lineItem.CO2,
				&lineItem.CO2Unit,
				&lineItem.Scope)
		if err != nil {
			return nil, fmt.Errorf("error querying database: %w", err)
		}
		createdLineItems = append(createdLineItems, lineItem)
	}
	return createdLineItems, nil
}

func createLineItemValidations(req models.CreateLineItemRequest) ([]string, []interface{}, error) {
	id := uuid.New().String()
	createdAt := time.Now().UTC()
	columns := []string{"id", "description", "quantity", "unit_amount", "company_id", "contact_id", "date", "currency_code"}
	// TODO: fix company id
	queryArgs := []interface{}{id, req.Description, req.Quantity, req.UnitAmount, req.CompanyID, req.ContactID, createdAt, req.CurrencyCode}

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
