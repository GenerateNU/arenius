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

	"github.com/lib/pq"
	"github.com/pkg/errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type LineItemRepository struct {
	db *pgxpool.Pool
}

func (r *LineItemRepository) GetLineItems(ctx context.Context, pagination utils.Pagination, filterParams models.GetLineItemsRequest) (*models.GetLineItemsResponse, error) {
	filterQuery := "WHERE 1=1"

	if filterParams.ReconciliationStatus != nil {
		if *filterParams.ReconciliationStatus {
			filterQuery += " AND (li.emission_factor_id IS NOT NULL)"
		} else {
			filterQuery += " AND (li.emission_factor_id IS NULL)"
		}
	}
	if filterParams.SearchTerm != nil {
		filterQuery += fmt.Sprintf(" AND (li.description ILIKE '%%%s%%')", *filterParams.SearchTerm)
	}

	filterColumns := []string{}
	filterArgs := []interface{}{}

	if filterParams.CompanyID != nil {
		filterColumns = append(filterColumns, "li.company_id=")
		filterArgs = append(filterArgs, *filterParams.CompanyID)
	}
	if filterParams.BeforeDate != nil {
		filterColumns = append(filterColumns, "li.date<=")
		filterArgs = append(filterArgs, filterParams.BeforeDate.UTC().Add(time.Hour*24))
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
	if filterParams.MinPrice != nil {
		filterColumns = append(filterColumns, "li.total_amount >=")
		filterArgs = append(filterArgs, *filterParams.MinPrice)
	}
	if filterParams.MaxPrice != nil {
		filterColumns = append(filterColumns, "li.total_amount <=")
		filterArgs = append(filterArgs, *filterParams.MaxPrice)
	}
	if filterParams.ContactID != nil {
		filterColumns = append(filterColumns, "li.contact_id=")
		filterArgs = append(filterArgs, *filterParams.ContactID)
	}

	for i := 0; i < len(filterColumns); i++ {
		filterQuery += fmt.Sprintf(" AND (%s$%d)", filterColumns[i], i+3)
	}

	query := `
	SELECT li.id, li.xero_line_item_id, li.description, li.total_amount, li.company_id, li.contact_id, c.name as contact_name, li.date, li.currency_code, li.emission_factor_id, ef.name as emission_factor_name, li.co2, li.co2_unit, li.scope
	FROM line_item li 
	LEFT JOIN emission_factor ef ON li.emission_factor_id = ef.activity_id
	LEFT JOIN contact c on li.contact_id = c.id ` + filterQuery + `
	ORDER BY li.date DESC
	LIMIT $1 OFFSET $2
	`

	queryArgs := append([]interface{}{pagination.Limit, pagination.GetOffset()}, filterArgs...)
	rows, err := r.db.Query(ctx, query, queryArgs...)
	if err != nil {
		return nil, err
	} 
	defer rows.Close()

	lineItems, err := pgx.CollectRows(rows, pgx.RowToStructByName[models.LineItemWithDetails])
	if err != nil {
		return nil, err
	}

	total_query := `
	SELECT count(*)
	FROM line_item li
	LEFT JOIN emission_factor ef ON li.emission_factor_id = ef.activity_id
	LEFT JOIN contact c on li.contact_id = c.id ` + filterQuery + `
	AND $1 AND $2
	` // The $1 and $2 are because filterQuery starts at $3, just make them dummy values here

	var total int
	countArgs := append([]interface{}{"TRUE", "TRUE"}, filterArgs...)
	err = r.db.QueryRow(ctx, total_query, countArgs...).Scan(&total)
	if err != nil {
		return nil, err
	}

	return &models.GetLineItemsResponse{Total: total, Count: len(lineItems), LineItems: lineItems}, nil
}

func (r *LineItemRepository) ReconcileLineItem(ctx context.Context, lineItemId string, scope int, emissionsFactorId string, contactID *string) (*models.LineItem, error) {

	query := `UPDATE line_item SET`
	updates := []string{}
	args := []interface{}{}
	argCount := 1

	if emissionsFactorId != "" {
		updates = append(updates, fmt.Sprintf("emission_factor_id = $%d", argCount))
		args = append(args, emissionsFactorId)
		argCount++
	}
	if scope != 0 {
		updates = append(updates, fmt.Sprintf("scope = $%d", argCount))
		args = append(args, scope)
		argCount++
	}
	if contactID != nil {
		updates = append(updates, fmt.Sprintf("contact_id = $%d", argCount))
		args = append(args, contactID)
		argCount++
	}

	if len(updates) == 0 {
		return nil, fmt.Errorf("no fields to update")
	}

	query += " " + strings.Join(updates, ", ")
	query += fmt.Sprintf(" WHERE id = $%d", argCount)
	args = append(args, lineItemId)

	query += " RETURNING id, xero_line_item_id, description, total_amount, company_id, contact_id, date, currency_code, emission_factor_id, co2, co2_unit, scope"

	rows, err := r.db.Query(ctx, query, args...)

	if err != nil {
		return nil, fmt.Errorf("error executing query: %w", err)
	}
	defer rows.Close()

	lineItem, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[models.LineItem])

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
		RETURNING id, xero_line_item_id, description, total_amount, company_id, contact_id, date, currency_code, emission_factor_id, co2, co2_unit, scope
	`

	rows, _ := r.db.Query(ctx, query, req.CO2, req.CO2Unit, req.LineItemId)
	lineItem, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[models.LineItem])

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
		RETURNING id, xero_line_item_id, description, total_amount, company_id, contact_id, date, currency_code, emission_factor_id, co2, co2_unit, scope;
	`

	rows, _ := r.db.Query(ctx, query, queryArgs...)
	lineItem, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[models.LineItem])

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

		for i := 1; i <= 8; i += 1 {
			inputNumbers = append(inputNumbers, fmt.Sprintf("$%d", (index*8)+i))
		}

		valuesStrings = append(valuesStrings, fmt.Sprintf("(%s)", strings.Join(inputNumbers, ",")))

		queryArgs = append(queryArgs,
			uuid.New().String(),
			importedLineItem.XeroLineItemID,
			importedLineItem.Description,
			importedLineItem.TotalAmount,
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
			(id, xero_line_item_id, description, total_amount, company_id, contact_id, date, currency_code)
			VALUES ` + strings.Join(valuesStrings, ",") + `
			ON  CONFLICT (xero_line_item_id) DO UPDATE
			SET
				description=EXCLUDED.description,
				total_amount=EXCLUDED.total_amount,
				company_id=EXCLUDED.company_id,
				contact_id=EXCLUDED.contact_id,
				date=EXCLUDED.date,
				currency_code=EXCLUDED.currency_code,
				emission_factor_id=NULL,
				co2=NULL,
				co2_unit=NULL,
				scope=NULL
			RETURNING id, xero_line_item_id, description, total_amount, company_id, contact_id, date, currency_code, emission_factor_id, co2, co2_unit, scope;
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
	columns := []string{"id", "description", "total_amount", "company_id", "contact_id", "date", "currency_code"}
	// TODO: fix company id
	queryArgs := []interface{}{id, req.Description, req.TotalAmount, req.CompanyID, req.ContactID, createdAt, req.CurrencyCode}

	// validate values in existing columns
	if _, err := uuid.Parse(req.ContactID); err != nil {
		return nil, nil, errs.BadRequest("Contact ID must be a UUID")
	}
	if _, err := uuid.Parse(req.CompanyID); err != nil {
		return nil, nil, errs.BadRequest("Company ID must be a UUID")
	}
	if req.TotalAmount < 0 {
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

func (r *LineItemRepository) BatchUpdateScopeEmissions(ctx context.Context, lineItemIDs []uuid.UUID, scope *int, emissionsFactorID *string) error {
	updates := []string{}
	values := []interface{}{}
	paramIndex := 1

	if scope != nil {
		updates = append(updates, fmt.Sprintf("scope = $%d", paramIndex))
		values = append(values, scope)
		paramIndex++
	}

	if emissionsFactorID != nil {
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

func (r *LineItemRepository) GetLineItemsByIds(ctx context.Context, lineItemIDs []uuid.UUID) ([]models.LineItem, error) {
	if len(lineItemIDs) == 0 {
		return nil, errors.New("no line item IDs provided")
	}

	const query = "SELECT id, total_amount, currency_code, emission_factor_id FROM line_item WHERE id = ANY($1)"
	rows, err := r.db.Query(ctx, query, pq.Array(lineItemIDs))
	if err != nil {
		return nil, errors.Wrap(err, "error querying line items")
	}
	defer rows.Close()

	var lineItems []models.LineItem
	for rows.Next() {
		var item models.LineItem
		err := rows.Scan(&item.ID, &item.TotalAmount, &item.CurrencyCode, &item.EmissionFactorId)
		if err != nil {
			return nil, errors.Wrap(err, "error scanning line item row")
		}
		lineItems = append(lineItems, item)
	}

	if err := rows.Err(); err != nil {
		return nil, errors.Wrap(err, "error iterating over line item rows")
	}

	return lineItems, nil
}

func NewLineItemRepository(db *pgxpool.Pool) *LineItemRepository {
	return &LineItemRepository{
		db,
	}
}
