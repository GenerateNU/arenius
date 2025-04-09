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
	tx, err := r.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}

	// Delete rows for the given company ID
	_, err = tx.Exec(ctx, `
		DELETE FROM public.line_item 
		WHERE company_id = $1`, companyId)
	if err != nil {
		tx.Rollback(ctx)
		return fmt.Errorf("failed to delete line items: %w", err)
	}

	// Insert new rows
	_, err = tx.Exec(ctx, `
	INSERT INTO "public"."line_item" ("id", "xero_line_item_id", "description", "total_amount", "company_id", "contact_id", "date", "currency_code", "emission_factor_id", "co2", "scope", "co2_unit", "recommended_scope", "recommended_emission_factor_id") VALUES ('2fe810b2-f29d-4550-be1f-f85578640d2a', 'fc43f3e2-479a-4125-8ca8-84cb6d33f9fb', 'Misc kitchen supplies for office', '65.2', '86afab0a-443f-4d9b-89d9-1f19a7ea6a14', 'f4a7ffa4-05d8-4266-bed2-0ddd3fed583b', '2024-12-19 00:00:00', 'USD', 'fuel-type_kerosene_type_jet_fuel-fuel_use_aviation', '20', '0', 'kg', null, null), ('2d07d609-b75a-4a1d-84cc-d2bfa4d96b1c', null, 'Misc kitchen supplies for office', '50', '86afab0a-443f-4d9b-89d9-1f19a7ea6a14', 'f4a7ffa4-05d8-4266-bed2-0ddd3fed583b', '2025-03-31 23:20:06', 'USD', 'accommodation-type_bed_and_breakfast_inns', '15', '0', null, null, null), ('55ff1487-465c-40a4-b667-994c30800cd9', 'a28bfd16-fd1d-4cb7-bfe8-d3bd9804230e', 'Monthly car park', '148.5', '86afab0a-443f-4d9b-89d9-1f19a7ea6a14', '0af99bbc-10e5-4bf6-b63e-1b07c2375c52', '2024-12-27 00:00:00', 'USD', 'agriculture_fishing_forestry-type_agriculture_forestry_support', '59.1', '1', 'kg', null, null), ('f4796fbc-8501-4790-a2b3-46b62c635daa', null, 'January gas', '5000', '86afab0a-443f-4d9b-89d9-1f19a7ea6a14', 'ffc3257f-3507-4ae7-b4ae-f03dffab7b55', '2025-04-10 00:00:00', 'USD', 'passenger_flight-route_type_nonscheduled_chartered_freight_air_transportation-aircraft_type_na-distance_na-class_na-rf_na-distance_uplift_na', '3220', '1', 'kg', null, null), ('2c3b8548-a15b-4aa3-8583-2166216df967', null, 'January Electricity', '32', '86afab0a-443f-4d9b-89d9-1f19a7ea6a14', 'b8c4b3e2-08f1-45e9-94a0-125a7e73b4d6', '2025-03-20 21:21:24.851192', 'USD', 'fuel-type_kerosene_type_jet_fuel-fuel_use_aviation', '120.6', '1', 'kg', null, null), ('c33af89c-40c4-4139-bac2-10d308841bcd', 'e86ea653-f4aa-42b4-9509-83e1f3b5339e', 'Lumber', '21.71', '86afab0a-443f-4d9b-89d9-1f19a7ea6a14', '794902f0-f455-4ed4-8415-f26014e62e17', '2024-12-05 00:00:00', 'USD', 'consumer_goods-type_lumber_treated_lumber', '6.73', '1', 'kg', null, null), ('f2d88d99-1b38-460b-a87b-d64ce1c25b10', 'c91481f4-d7fd-4988-8697-677f8c422ad6', 'Monthly carpark', '148.5', '86afab0a-443f-4d9b-89d9-1f19a7ea6a14', '0af99bbc-10e5-4bf6-b63e-1b07c2375c52', '2025-02-02 00:00:00', 'USD', 'agriculture_fishing_forestry-type_agriculture_forestry_support', '59.1', '1', 'kg', null, null), ('ebf1b107-0595-42d0-963b-dead930cba64', null, 'Team coffee', '2', '86afab0a-443f-4d9b-89d9-1f19a7ea6a14', 'b10da304-4b03-4a91-bad3-990f2ec31f24', '2025-04-08 00:00:00', 'USD', 'passenger_flight-route_type_nonscheduled_chartered_freight_air_transportation-aircraft_type_na-distance_na-class_na-rf_na-distance_uplift_na', '1.288', '1', 'kg', null, null), ('6599d114-c531-4334-bcb9-85a4248995ca', '724cae02-3fe4-4f14-ab92-73c2f9b54e8b', 'Jet fuel', '15.6', '86afab0a-443f-4d9b-89d9-1f19a7ea6a14', '46782fd1-821c-45bd-bd11-5402e57cf036', '2024-12-20 00:00:00', 'USD', 'fuel-type_kerosene_type_jet_fuel-fuel_use_aviation', '58.78', '2', 'kg', null, null), ('bdafcbf8-01ab-4d13-9674-8de51c22b452', null, 'electricity', '400', '86afab0a-443f-4d9b-89d9-1f19a7ea6a14', 'ffc3257f-3507-4ae7-b4ae-f03dffab7b55', '2025-04-08 00:00:00', 'USD', 'energy_services-type_transmission_of_electricity_services', '3134', '2', 'kg', null, null), ('7472d4b0-13ce-42a0-8f74-5e6cf991505d', 'e5108391-23f7-4c6f-a527-632e668ce167', 'SPEND to Willow Properties', '1181', '86afab0a-443f-4d9b-89d9-1f19a7ea6a14', 'e94ef795-c4c8-4634-95ba-eea9fee90648', '2025-03-01 00:00:00', 'USD', 'building_materials-type_clay_building_material_and_refractories', '532.6', '2', 'kg', null, null), ('2c9e4728-c3a3-4bf0-b742-0b9cfe88d2ff', '18b8aa6f-282c-4fd9-8d31-1dc8a6e1e53d', 'SPEND to Ridgeway Bank', '15', '86afab0a-443f-4d9b-89d9-1f19a7ea6a14', 'b2c3929b-34e2-4a9f-8372-7e79ea41833a', '2024-12-04 00:00:00', 'USD', 'freight_flight-route_type_na-distance_na-weight_na-rf_na', null, '2', null, null, null), ('7d123ab8-5bec-4925-8d22-418b8359af02', '67b2d60d-75c1-451b-a936-d8b37e87f336', 'Photocopier paper', '49.2', '86afab0a-443f-4d9b-89d9-1f19a7ea6a14', 'c1de74c1-bf39-446c-86bc-198cd1943385', '2025-02-05 00:00:00', 'USD', 'arable_farming-type_corn_farming', '41.72', '2', 'kg', null, null), ('e5e6f701-8a27-49c1-a4d2-50fa8c5f5503', '005d03e0-15f5-4e5b-9592-fe0dc08f52c3', 'Staff coffees', '22', '86afab0a-443f-4d9b-89d9-1f19a7ea6a14', '46782fd1-821c-45bd-bd11-5402e57cf036', '2025-02-06 00:00:00', 'USD', 'accommodation-type_casino_hotels', null, '2', null, null, null), ('db33aa60-9454-45d9-9898-24bafe8d974a', '709def98-fe2f-4cf9-a7ff-c9f820ab64d2', 'Subscription', '49.9', '86afab0a-443f-4d9b-89d9-1f19a7ea6a14', 'e94ef795-c4c8-4634-95ba-eea9fee90648', '2025-03-03 00:00:00', 'USD', 'building_materials-type_concrete_pipe_bricks_and_blocks', '25.7', '2', 'kg', null, null), ('fe2b12de-d9ce-46b7-80a7-9c8b109b52a7', 'eb556fb8-80e6-4abf-b953-dfed67d2ac45', 'SPEND to Ridgeway Bank', '15', '86afab0a-443f-4d9b-89d9-1f19a7ea6a14', 'b2c3929b-34e2-4a9f-8372-7e79ea41833a', '2025-01-04 00:00:00', 'USD', 'freight_flight-route_type_na-distance_na-weight_na-rf_na', '9.66', '2', 'kg', null, null), ('6e540370-f27a-4768-8d9b-052cd208278d', '04c25893-0662-4765-9da4-e9b7fb9267c8', 'Bouquet for client', '50', '86afab0a-443f-4d9b-89d9-1f19a7ea6a14', 'ce39a945-b224-49e5-a24f-e9ad75d42476', '2024-12-28 00:00:00', 'USD', 'freight_flight-route_type_na-distance_na-weight_na-rf_na', '32.2', '2', 'kg', null, null), ('da8e6cf1-abca-40cb-a66c-bd3d70c7f61e', null, 'January gas', '400', '86afab0a-443f-4d9b-89d9-1f19a7ea6a14', 'ffc3257f-3507-4ae7-b4ae-f03dffab7b55', '2025-04-07 00:00:00', 'USD', 'fuel-type_biogas-fuel_use_na', '3625', '2', 'kg', null, null), ('1fe06e36-f21e-46aa-9c4a-ad705a9c78c2', '7722154f-d917-492d-86de-91031202b081', 'Emergency locksmith - front office door', '69.5', '86afab0a-443f-4d9b-89d9-1f19a7ea6a14', 'c1de74c1-bf39-446c-86bc-198cd1943385', '2025-02-08 00:00:00', 'USD', 'building_materials-type_concrete_block_and_brick', '22.8', '3', 'kg', null, null), ('9f59f91c-272f-4461-ae3e-44f2e41c041d', 'b3cece10-cd63-491c-b82a-c51c973b645c', 'Zains Bakery - Office Catering', '146.5', '86afab0a-443f-4d9b-89d9-1f19a7ea6a14', '4e689492-7920-4149-94e8-240b12f25c2e', '2017-07-19 00:00:00', 'USD', null, null, null, null, null, null), ('e5565892-eb22-4eda-b9bf-a8407cc1788b', 'c0ca0f26-217d-4092-889c-892d5fe5d916', 'Team coffees', '16', '86afab0a-443f-4d9b-89d9-1f19a7ea6a14', '347065e7-7623-427d-a022-2079a3cd1326', '2024-12-27 00:00:00', 'USD', 'passenger_flight-route_type_nonscheduled_chartered_freight_air_transportation-aircraft_type_na-distance_na-class_na-rf_na-distance_uplift_na', '10.3', null, 'kg', null, null), ('4fd9b1e8-cc47-4998-8d20-621f783903a2', null, 'January electricity', '300', '86afab0a-443f-4d9b-89d9-1f19a7ea6a14', 'ffc3257f-3507-4ae7-b4ae-f03dffab7b55', '2025-04-09 00:00:00', 'USD', null, null, null, null, null, null), ('5e9af714-a787-4ddf-a8dc-525a1acd3b03', null, 'January gas', '200', '86afab0a-443f-4d9b-89d9-1f19a7ea6a14', 'ffc3257f-3507-4ae7-b4ae-f03dffab7b55', '2025-04-09 00:00:00', 'USD', null, null, null, null, null, null), ('55b0e77b-cd19-401c-b4b6-7a3eb98964bd', '251b9455-cabf-44a4-b56d-60a8ceec9779', 'Misc kitchen supplies for office', '34.1', '86afab0a-443f-4d9b-89d9-1f19a7ea6a14', 'f4a7ffa4-05d8-4266-bed2-0ddd3fed583b', '2025-02-04 00:00:00', 'USD', 'agriculture_fishing_forestry-type_agriculture_forestry_support', '13.57', null, 'kg', null, null);	
	`)

	if err != nil {
		tx.Rollback(ctx)
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
