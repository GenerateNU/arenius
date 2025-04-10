package schema

import (
	"arenius/internal/errs"
	"arenius/internal/models"
	"arenius/internal/service/utils"
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
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
	var filterQuery strings.Builder
	filterQuery.WriteString("WHERE 1=1")
	filterArgs := []interface{}{}

	// Apply reconciliation status filtering
	if filterParams.ReconciliationStatus != nil {
		switch *filterParams.ReconciliationStatus {
		case "reconciled":
			filterQuery.WriteString(" AND (li.emission_factor_id IS NOT NULL AND (li.scope != 0 OR li.scope IS NULL))")
		case "recommended":
			filterQuery.WriteString(" AND (li.emission_factor_id IS NULL) AND (li.recommended_emission_factor_id IS NOT NULL)")
		case "offsets":
			filterQuery.WriteString(" AND (li.scope = 0)")
		case "unreconciled":
			filterQuery.WriteString(" AND (li.emission_factor_id IS NULL AND (li.scope != 0 OR li.scope IS NULL))")
		}
	}

	// Apply search filtering
	if filterParams.SearchTerm != nil {
		filterQuery.WriteString(fmt.Sprintf(" AND (li.description ILIKE '%%%s%%')", *filterParams.SearchTerm))
	}

	// Apply dynamic filters
	filterFields := map[string]interface{}{}

	if filterParams.CompanyID != nil {
		filterFields["li.company_id="] = *filterParams.CompanyID
	}
	if filterParams.Scope != nil {
		filterFields["li.scope="] = *filterParams.Scope
	}
	if filterParams.EmissionFactor != nil {
		filterFields["ef.activity_id="] = *filterParams.EmissionFactor
	}
	if filterParams.MinPrice != nil {
		filterFields["li.total_amount>="] = *filterParams.MinPrice
	}
	if filterParams.MaxPrice != nil {
		filterFields["li.total_amount<="] = *filterParams.MaxPrice
	}
	if filterParams.ContactID != nil {
		filterFields["li.contact_id="] = *filterParams.ContactID
	}
	if filterParams.BeforeDate != nil {
		filterFields["li.date<="] = filterParams.BeforeDate.UTC().Add(24 * time.Hour)
	}
	if filterParams.AfterDate != nil {
		filterFields["li.date>="] = filterParams.AfterDate.UTC()
	}

	for col, val := range filterFields {
		if val != nil {
			filterQuery.WriteString(fmt.Sprintf(" AND (%s $%d)", col, len(filterArgs)+1))
			filterArgs = append(filterArgs, val)
		}
	}

	// Apply pagination if needed
	var paginationClause string
	if filterParams.Unpaginated != nil && !*filterParams.Unpaginated {
		paginationClause = fmt.Sprintf(" LIMIT %d OFFSET %d", pagination.Limit, pagination.GetOffset())
	}

	query := fmt.Sprintf(`
	SELECT li.id, li.xero_line_item_id, li.description, li.total_amount, li.company_id, li.contact_id, 
	       c.name as contact_name, li.date, li.currency_code, li.emission_factor_id, ef.name as emission_factor_name, 
	       li.co2, li.co2_unit, li.scope, li.recommended_emission_factor_id, li.recommended_scope, 
	       rec_ef.name as recommended_emission_factor_name
	FROM line_item li 
	LEFT JOIN emission_factor ef ON li.emission_factor_id = ef.activity_id
	LEFT JOIN emission_factor rec_ef ON li.recommended_emission_factor_id = rec_ef.activity_id
	LEFT JOIN contact c ON li.contact_id = c.id 
	%s
	ORDER BY li.date DESC
	%s`, filterQuery.String(), paginationClause)

	rows, err := r.db.Query(ctx, query, filterArgs...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	lineItems, err := pgx.CollectRows(rows, pgx.RowToStructByName[models.LineItemWithDetails])
	if err != nil {
		return nil, err
	}

	// Count total matching rows
	totalQuery := fmt.Sprintf(`
	SELECT count(*)
	FROM line_item li
	LEFT JOIN emission_factor ef ON li.emission_factor_id = ef.activity_id
	LEFT JOIN contact c ON li.contact_id = c.id 
	%s`, filterQuery.String())

	var total int
	err = r.db.QueryRow(ctx, totalQuery, filterArgs...).Scan(&total)
	if err != nil {
		return nil, err
	}

	return &models.GetLineItemsResponse{Total: total, Count: len(lineItems), LineItems: lineItems}, nil
}

func (r *LineItemRepository) ReconcileLineItem(ctx context.Context, lineItemId string, scope int, emissionsFactorId string, contactID *string, co2 *float64, co2Unit *string) (*models.LineItem, error) {

	query := `UPDATE line_item SET`
	updates := []string{}
	args := []interface{}{}
	argCount := 1

	if emissionsFactorId != "" {
		updates = append(updates, fmt.Sprintf("emission_factor_id = $%d", argCount))
		args = append(args, emissionsFactorId)
		argCount++
	}
	if scope == 0 || scope == 1 || scope == 2 || scope == 3 {
		updates = append(updates, fmt.Sprintf("scope = $%d", argCount))
		args = append(args, scope)
		argCount++
	}
	if contactID != nil {
		updates = append(updates, fmt.Sprintf("contact_id = $%d", argCount))
		args = append(args, contactID)
		argCount++
	}
	if co2 != nil {
		updates = append(updates, fmt.Sprintf("co2 = $%d", argCount))
		args = append(args, co2)
		argCount++
	}
	if co2Unit != nil {
		updates = append(updates, fmt.Sprintf("co2_unit = $%d", argCount))
		args = append(args, co2Unit)
		argCount++
	}

	if len(updates) == 0 {
		return nil, fmt.Errorf("no fields to update")
	}

	query += " " + strings.Join(updates, ", ")
	query += fmt.Sprintf(" WHERE id = $%d", argCount)
	args = append(args, lineItemId)

	query += " RETURNING id, xero_line_item_id, description, total_amount, company_id, contact_id, date, currency_code, emission_factor_id, co2, co2_unit, scope, recommended_emission_factor_id, recommended_scope"

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
		RETURNING id, xero_line_item_id, description, total_amount, company_id, contact_id, date, currency_code, emission_factor_id, co2, co2_unit, scope, recommended_emission_factor_id, recommended_scope;
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
		RETURNING id, xero_line_item_id, description, total_amount, company_id, contact_id, date, currency_code, emission_factor_id, co2, co2_unit, scope, recommended_emission_factor_id, recommended_scope;
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
			RETURNING id, xero_line_item_id, description, total_amount, company_id, contact_id, date, currency_code, emission_factor_id, co2, co2_unit, scope, recommended_emission_factor_id, recommended_scope;
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
	columns := []string{"id", "description", "total_amount", "company_id", "contact_id", "date", "currency_code"}
	// TODO: fix company id
	queryArgs := []interface{}{id, req.Description, req.TotalAmount, req.CompanyID, req.ContactID, req.Date, req.CurrencyCode}

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
	if req.EmissionFactorId != nil && *req.EmissionFactorId != "" {
		columns = append(columns, "emission_factor_id")
		queryArgs = append(queryArgs, *req.EmissionFactorId)
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

func (r *LineItemRepository) BatchUpdateLineItems(ctx context.Context, lineItemIDs []uuid.UUID, scope *int, emissionsFactorID *string, co2 *float64, co2Unit *string) error {
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
	if co2 != nil {
		updates = append(updates, fmt.Sprintf("co2 = $%d", paramIndex))
		values = append(values, co2)
		paramIndex++
	}
	if co2Unit != nil {
		updates = append(updates, fmt.Sprintf("co2_unit = $%d", paramIndex))
		values = append(values, co2Unit)
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

func (r *LineItemRepository) AutoReconcileLineItems(ctx context.Context, companyId uuid.UUID) ([]models.LineItem, error) {
	const unreconciledTransactionsQuery = `
        SELECT id, description
        FROM line_item
        WHERE emission_factor_id IS NULL
          AND scope IS NULL
          AND company_id = $1;
    `
	unreconciledRows, err := r.db.Query(ctx, unreconciledTransactionsQuery, companyId)
	if err != nil {
		return nil, err
	}
	defer unreconciledRows.Close()

	unreconciledTransactions, err := pgx.CollectRows(unreconciledRows, pgx.RowToStructByName[models.UnreconciledLineItem])
	if err != nil {
		return nil, err
	}

	if len(unreconciledTransactions) == 0 {
		return []models.LineItem{}, nil
	}

	const pastTransactionsQuery = `
		SELECT line_item.description, emission_factor.name AS emissions_factor, emission_factor.activity_id AS emissions_factor_id, line_item.scope
		FROM line_item
		JOIN emission_factor ON line_item.emission_factor_id = emission_factor.activity_id
		WHERE line_item.company_id = $1
		ORDER BY line_item.date DESC
		LIMIT 100;
	`
	pastRows, err := r.db.Query(ctx, pastTransactionsQuery, companyId)
	if err != nil {
		return nil, err
	}
	defer pastRows.Close()

	pastTransactions, err := pgx.CollectRows(pastRows, pgx.RowToStructByName[models.PastLineItemDetails])
	if err != nil {
		return nil, err
	}

	if len(pastTransactions) == 0 {
		return []models.LineItem{}, nil
	}

	reconciliationQuery := models.LineItemReconciliationQuery{
		PastTransactions:         pastTransactions,
		UnreconciledTransactions: unreconciledTransactions,
	}

	jsonBody, err := json.Marshal(reconciliationQuery)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("GET", "https://reconciliation-recommendation.onrender.com/reconciliation/get-recommendation", bytes.NewBuffer(jsonBody))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("recommendation service returned status: %s", resp.Status)
	}

	var recommendations []models.Recommendation
	if err := json.NewDecoder(resp.Body).Decode(&recommendations); err != nil {
		return nil, err
	}

	if len(recommendations) == 0 {
		return []models.LineItem{}, nil
	}

	var (
		valueArgs         []interface{}
		valuePlaceholders []string
	)
	for i, rec := range recommendations {
		idx := i * 3

		parsedID, err := uuid.Parse(rec.ID)
		if err != nil {
			return nil, fmt.Errorf("invalid UUID in recommendation: %v", err)
		}

		valuePlaceholders = append(valuePlaceholders, fmt.Sprintf("($%d::uuid, $%d::int, $%d::text)", idx+1, idx+2, idx+3))
		valueArgs = append(valueArgs, parsedID, rec.RecommendedScope, rec.RecommendedEmissionsFactorID)
	}

	updateQuery := fmt.Sprintf(`
        WITH updates(id, scope, emission_factor_id) AS (
            VALUES %s
        )
        UPDATE line_item AS li
        SET
            recommended_scope = updates.scope,
            recommended_emission_factor_id = updates.emission_factor_id
        FROM updates
        WHERE li.id = updates.id;
    `, strings.Join(valuePlaceholders, ", "))

	_, err = r.db.Exec(ctx, updateQuery, valueArgs...)
	if err != nil {
		return nil, fmt.Errorf("bulk update failed: %w", err)
	}

	updatedUUIDs := make([]uuid.UUID, len(recommendations))
	for i, rec := range recommendations {
		id, err := uuid.Parse(rec.ID)
		if err != nil {
			return nil, fmt.Errorf("invalid UUID in recommendation: %v", err)
		}
		updatedUUIDs[i] = id
	}

	idPlaceholders := make([]string, len(updatedUUIDs))
	idArgs := make([]interface{}, len(updatedUUIDs))
	for i, id := range updatedUUIDs {
		idPlaceholders[i] = fmt.Sprintf("$%d", i+1)
		idArgs[i] = id
	}

	selectQuery := fmt.Sprintf(`
        SELECT 
            id, 
            xero_line_item_id, 
            description, 
            total_amount, 
            company_id, 
            contact_id, 
            date, 
            currency_code, 
            emission_factor_id, 
            recommended_emission_factor_id,
            co2, 
            scope, 
            recommended_scope,
            co2_unit
        FROM line_item
        WHERE id IN (%s);
    `, strings.Join(idPlaceholders, ", "))

	rows, err := r.db.Query(ctx, selectQuery, idArgs...)
	if err != nil {
		return nil, fmt.Errorf("fetching updated line_items failed: %w", err)
	}
	defer rows.Close()

	updatedLineItems, err := pgx.CollectRows(rows, pgx.RowToStructByName[models.LineItem])
	if err != nil {
		return nil, fmt.Errorf("parsing updated line_items failed: %w", err)
	}

	return updatedLineItems, nil
}

func (r *LineItemRepository) HandleRecommendation(ctx context.Context, lineItemId uuid.UUID, accept bool) (*models.LineItem, error) {
	acceptQuery := ""
	if accept {
		acceptQuery = `
			emission_factor_id = recommended_emission_factor_id,
			scope = recommended_scope,
		`
	}

	updateQuery := `
		UPDATE line_item
		SET
		` + acceptQuery + `
			recommended_emission_factor_id = NULL,
			recommended_scope = NULL
		WHERE id = $1
		RETURNING 
			id, 
			xero_line_item_id, 
			description, 
			total_amount, 
			company_id, 
			contact_id, 
			date, 
			currency_code, 
			emission_factor_id, 
			co2, 
			scope, 
			co2_unit,
			recommended_emission_factor_id,
			recommended_scope
	`

	rows, err := r.db.Query(ctx, updateQuery, lineItemId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	lineItem, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[models.LineItem])
	if err != nil {
		return nil, err
	}

	return &lineItem, nil
}

func (r *LineItemRepository) Checkpoint(ctx context.Context, companyId uuid.UUID) error {
	// WARNING: ONLY USE FOR THE DEMO ACCOUNT AT SHOWCASE!!

	tx, err := r.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}

	// Delete rows for the given company ID
	_, err = tx.Exec(ctx, `
		DELETE FROM public.line_item 
		WHERE company_id = $1`, companyId)
	if err != nil {
		err := tx.Rollback(ctx)
		if err != nil && err != sql.ErrTxDone {
			log.Fatalf("rollback failed: %v", err)
		}
		return fmt.Errorf("failed to delete line items: %w", err)
	}

	// Insert new rows
	_, err = tx.Exec(ctx, `
	INSERT INTO "public"."line_item" ("id", "xero_line_item_id", "description", "total_amount", "company_id", "contact_id", "date", "currency_code", "emission_factor_id", "co2", "scope", "co2_unit", "recommended_scope", "recommended_emission_factor_id") VALUES ('153f7ad6-4b93-4104-8e5d-f73430536185', null, 'Initial propery insurance', '950', '47d9298d-e8f3-48e8-b584-071be7c79742', 'b2c3929b-34e2-4a9f-8372-7e79ea41833a', '2024-10-06 00:00:00', 'USD', 'insurance-type_direct_property_and_casualty_insurance_carriers', '31.35', '3', 'kg', null, null), ('f3222067-7d3b-4570-b95d-a3d5123bdb7a', null, 'Lumber for initial renovations', '2850', '47d9298d-e8f3-48e8-b584-071be7c79742', 'ebc27628-38fa-4371-8af2-d4a12f4540f5', '2024-10-09 00:00:00', 'USD', 'wholesale_trade-type_lumber_plywood_millwork_and_wood_panel_merchant_wholesalers', '307.8', '3', 'kg', null, null), ('4f2ac044-905e-4cb8-852e-2320fb63c98f', null, 'December electricity', '1250', '47d9298d-e8f3-48e8-b584-071be7c79742', '97955b6c-e2aa-4cae-b346-7078e91a8d8e', '2024-12-31 00:00:00', 'USD', 'electricity-supply_na-source_na', '5029', '2', 'kg', null, null), ('339a1b31-b8ea-4735-bbaf-169280cf3a90', null, 'Branded package labels', '4850', '47d9298d-e8f3-48e8-b584-071be7c79742', '13d9a820-92c3-43d0-89cb-eed4166925ed', '2025-01-13 00:00:00', 'USD', 'professional_services-type_packaging_and_labeling_services', '616', '1', 'kg', null, null), ('f0b06152-bd71-4440-8652-1c0172f42cd1', null, 'Cloud services (AWS)', '5522', '47d9298d-e8f3-48e8-b584-071be7c79742', '532d088f-5c83-4f35-8af2-2468e9067977', '2025-01-31 00:00:00', 'USD', 'professional_services-type_computer_related_services', '4836', '3', 'kg', null, null), ('76a20a45-6670-4fc0-8f79-effa3f203b4b', null, 'Carbon Credits', '300', '47d9298d-e8f3-48e8-b584-071be7c79742', '91b34257-25bf-4b9e-8d14-43244fdcde99', '2025-02-12 00:00:00', 'USD', null, '750', '0', 'kg', null, null), ('a01e5895-2e2e-44e9-b490-4dfc89c29d9f', null, 'On-site diesel generator fuel', '688', '47d9298d-e8f3-48e8-b584-071be7c79742', '32e09fa7-b2b2-4088-9dd2-0701e90ecdcb', '2025-02-20 00:00:00', 'USD', 'fuel-type_gas_diesel_oil-fuel_use_na', '3213', '3', 'kg', null, null), ('8219ad18-e93a-4e42-9b76-bf296032e3eb', null, 'Company car gas', '450', '47d9298d-e8f3-48e8-b584-071be7c79742', '8b01c093-e07c-44ba-962a-c7e1e1bdd12f', '2025-03-10 00:00:00', 'USD', 'fuel-type_motor_gasoline-fuel_use_na', '1054', '1', 'kg', null, null), ('bc2546fe-ab1f-4b8a-bdcd-10052142a10e', null, 'Conference flights', '2400', '47d9298d-e8f3-48e8-b584-071be7c79742', 'b0b250b5-c38f-4bb6-86de-5b88cd44f1b4', '2025-03-14 00:00:00', 'USD', 'passenger_flight-route_type_scheduled_passenger_air_transportation-aircraft_type_na-distance_na-class_na-rf_na-distance_uplift_na', '1546', '2', 'kg', null, null), ('26b938a7-ec0f-4135-a7c6-438b44d9cce4', null, 'Client dinner', '189', '47d9298d-e8f3-48e8-b584-071be7c79742', '3b113506-2324-49ac-8cca-f79944e21be9', '2025-03-21 00:00:00', 'USD', null, null, null, null, '3', 'consumer_services-type_full_service_restaurants'), ('43bd368a-d316-48da-9a41-53ebc6d31d4f', null, 'Product shipment from Australia', '2900', '47d9298d-e8f3-48e8-b584-071be7c79742', 'f115661a-0468-41ef-9cd9-0cfcd2ccd425', '2025-03-21 00:00:00', 'USD', 'sea_freight-vessel_type_water_transport_boats_ships_ferries-route_type_na-vessel_length_na-tonnage_na-fuel_source_na', '2030', '3', 'kg', null, null), ('a0b3708d-d02d-4948-ad0b-c7c1db748621', null, 'Waste incineration (offsite)', '1250', '47d9298d-e8f3-48e8-b584-071be7c79742', '87056b27-7e31-43b6-9c5e-be6957b6d6f1', '2025-03-25 00:00:00', 'USD', 'waste_management-type_food_waste_for_treatment_incineration', '3590', '3', 'kg', null, null), ('464fe8ba-7eef-444f-b293-2d0551a13cf1', null, 'April electricity', '824', '47d9298d-e8f3-48e8-b584-071be7c79742', '97955b6c-e2aa-4cae-b346-7078e91a8d8e', '2025-04-02 00:00:00', 'USD', null, null, null, null, '2', 'electricity-supply_na-source_na'), ('540a3087-932e-411c-a5c0-7234c12fbd69', null, 'Generator use from power outage', '180', '47d9298d-e8f3-48e8-b584-071be7c79742', 'fe86062f-a835-402f-b76c-d41cf8c06ba5', '2025-04-04 00:00:00', 'USD', 'fuel-type_gas_diesel_oil-fuel_use_na', '841', '1', 'kg', null, null), ('a5a4aa34-6f5b-462f-b3dd-3702229d2827', null, 'Forklift retreading', '670', '47d9298d-e8f3-48e8-b584-071be7c79742', '8b01c093-e07c-44ba-962a-c7e1e1bdd12f', '2025-04-07 00:00:00', 'USD', null, null, null, null, '3', 'wholesale_trade-type_lumber_plywood_millwork_and_wood_panel_merchant_wholesalers'), ('8b623048-a6ad-4491-aa2b-2267e37ca8ce', null, 'Emergency flight for maintenance', '1600', '47d9298d-e8f3-48e8-b584-071be7c79742', 'b0b250b5-c38f-4bb6-86de-5b88cd44f1b4', '2025-04-08 00:00:00', 'USD', null, null, null, null, '2', 'passenger_flight-route_type_scheduled_passenger_air_transportation-aircraft_type_na-distance_na-class_na-rf_na-distance_uplift_na'), ('d2b6a9f0-a1a4-4fbf-bbaa-d366dff37029', null, 'Client dinners', '2350', '47d9298d-e8f3-48e8-b584-071be7c79742', 'e94ef795-c4c8-4634-95ba-eea9fee90648', '2025-04-09 00:00:00', 'USD', 'consumer_services-type_full_service_restaurants', '455.9', '3', 'kg', null, null), ('9f04e65d-9ba2-4cca-b049-35a0a1d86c31', null, 'Unscheduled flight to HQ', '1570', '47d9298d-e8f3-48e8-b584-071be7c79742', 'b0b250b5-c38f-4bb6-86de-5b88cd44f1b4', '2025-04-09 00:00:00', 'USD', null, null, null, null, '2', 'passenger_flight-route_type_scheduled_passenger_air_transportation-aircraft_type_na-distance_na-class_na-rf_na-distance_uplift_na'), ('5bf1765f-7db1-41f0-aacb-f747158a92e7', null, 'April electricity', '750', '47d9298d-e8f3-48e8-b584-071be7c79742', '97955b6c-e2aa-4cae-b346-7078e91a8d8e', '2025-04-09 00:00:00', 'USD', 'electricity-supply_na-source_na', '3017', '2', 'kg', null, null), ('b175edd8-1fbc-433e-88ff-c8653e993d3e', null, 'On-premises Ghibli LLM training', '5600', '47d9298d-e8f3-48e8-b584-071be7c79742', 'fe86062f-a835-402f-b76c-d41cf8c06ba5', '2025-04-09 00:00:00', 'USD', 'communication_services-type_data_processing_hosting', '520.8', '1', 'kg', null, null);
		`)

	if err != nil {
		err := tx.Rollback(ctx)
		if err != nil && err != sql.ErrTxDone {
			log.Fatalf("rollback failed: %v", err)
		}
		return fmt.Errorf("failed to insert line items: %w", err)
	}

	// Commit the transaction
	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func NewLineItemRepository(db *pgxpool.Pool) *LineItemRepository {
	return &LineItemRepository{
		db,
	}
}
