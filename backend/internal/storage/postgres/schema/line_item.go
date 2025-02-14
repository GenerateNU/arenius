package schema

import (
	"arenius/internal/errs"
	"arenius/internal/models"
	"arenius/internal/service/utils"
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
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
		filterColumns = append(filterColumns, "li.company_id=")
		filterArgs = append(filterArgs, *filterParams.CompanyID)
	}
	if filterParams.BeforeDate != nil {
		filterColumns = append(filterColumns, "li.date<=")
		filterArgs = append(filterArgs, filterParams.BeforeDate.UTC())
	}
	if filterParams.AfterDate != nil {
		filterColumns = append(filterColumns, "li.date>=")
		filterArgs = append(filterArgs, filterParams.AfterDate.UTC())
	}
	if filterParams.Scope != nil {
		filterColumns = append(filterColumns, "li.scope=")
		filterArgs = append(filterArgs, *filterParams.Scope)
	}
	if filterParams.EmissionFactor != nil {
		filterColumns = append(filterColumns, "ef.activity_id=")
		filterArgs = append(filterArgs, *filterParams.EmissionFactor)
	}

	for i := 0; i < len(filterColumns); i++ {
		filterQuery += fmt.Sprintf(" AND %s$%d", filterColumns[i], i+3)
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
	var valuesStrings []string
	var queryArgs []interface{}

	for index, importedLineItem := range req {
		var inputNumbers []string

		for i := 1; i <= 9; i += 1 {
			inputNumbers = append(inputNumbers, fmt.Sprintf("$%d", (index*9)+i))
		}

		valuesStrings = append(valuesStrings, fmt.Sprintf("(%s)", strings.Join(inputNumbers, ",")))

		queryArgs = append(queryArgs,
			uuid.New().String(),
			importedLineItem.XeroLineItemID,
			importedLineItem.Description,
			importedLineItem.Quantity,
			importedLineItem.UnitAmount,
			importedLineItem.CompanyID,
			importedLineItem.ContactID,
			importedLineItem.Date.UTC(),
			importedLineItem.CurrencyCode)
	}
	if len(req) > 0 {
		transaction, txErr := r.db.Begin(ctx)
		if txErr != nil {
			return nil, txErr
		}

		defer func() {
			if rollbackErr := transaction.Rollback(ctx); rollbackErr != nil && rollbackErr != sql.ErrTxDone && txErr == nil {
				txErr = rollbackErr
			}
		}()

		query := `
			INSERT INTO line_item
			(id, xero_line_item_id, description, quantity, unit_amount, company_id, contact_id, date, currency_code)
			VALUES ` + strings.Join(valuesStrings, ",") + `
			ON  CONFLICT (xero_line_item_id) DO UPDATE
			SET description=EXCLUDED.description, quantity=EXCLUDED.quantity,
				unit_amount=EXCLUDED.unit_amount, company_id=EXCLUDED.company_id,
				contact_id=EXCLUDED.contact_id, date=EXCLUDED.date, currency_code=EXCLUDED.currency_code,
				emission_factor_id=NULL, co2=NULL, co2_unit=NULL, scope=NULL
			RETURNING id, xero_line_item_id, description, quantity, unit_amount, company_id, contact_id, date, currency_code, emission_factor_id, NULL as emission_factor_name, co2, co2_unit, scope;
		`
		rows, err := r.db.Query(ctx, query, queryArgs...)
		if err != nil {
			return nil, err
		}
		defer rows.Close()

		lineItems, err := pgx.CollectRows(rows, pgx.RowToStructByName[models.LineItem])
		if err != nil {
			return nil, err
		}

		if commitErr := transaction.Commit(ctx); commitErr != nil {
			txErr = commitErr
		}

		return lineItems, txErr
	}
	return nil, nil
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

func (r *LineItemRepository) BatchUpdateScopeEmissions(ctx context.Context, lineItemIDs []uuid.UUID, scope *int, emissionsFactorID string) error {
	updates := []string{}
	values := []interface{}{}
	paramIndex := 1

	if scope != nil {
		updates = append(updates, fmt.Sprintf("scope = $%d", paramIndex))
		values = append(values, scope)
		paramIndex++
	}

	if emissionsFactorID != "" {
		updates = append(updates, fmt.Sprintf("emission_factor_id = $%d", paramIndex))
		values = append(values, emissionsFactorID)
		paramIndex++
	}

	values = append(values, lineItemIDs)

	query := fmt.Sprintf(
		"UPDATE line_item SET %s WHERE id = ANY($%d)",
		strings.Join(updates, ", "),
		paramIndex,
	)

	_, err := r.db.Exec(ctx, query, values...)
	return err
}

func NewLineItemRepository(db *pgxpool.Pool) *LineItemRepository {
	return &LineItemRepository{
		db,
	}
}
