package schema

import (
	"arenius/internal/errs"
	"arenius/internal/models"
	"arenius/internal/service/utils"
	"context"
	"database/sql"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ContactRepository struct {
	db *pgxpool.Pool
}

func (r *ContactRepository) GetContact(ctx context.Context, contactId string) (*models.ContactWithDetails, error) {
	const query = `
		SELECT
			id,
			name,
			email,
			phone,
			city,
			state,
			xero_contact_id,
			company_id
		FROM contact
		WHERE contact.id = $1
		LIMIT 1
	`

	rows, err := r.db.Query(ctx, query, contactId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	contact, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[models.Contact])

	if err != nil {
		return nil, fmt.Errorf("error querying database for contact: %w", err)
	}

	const summaryQuery = `
		SELECT 
			COALESCE(SUM(total_amount), 0) AS total_spent,
			COUNT(*) AS total_transactions,
			COALESCE(SUM(co2), 0) AS total_emissions
		FROM line_item
		WHERE contact_id = $1;
	`

	summaryRows, err := r.db.Query(ctx, summaryQuery, contactId)
	if err != nil {
		return nil, err
	}
	defer summaryRows.Close()

	summary, err := pgx.CollectOneRow(summaryRows, pgx.RowToStructByName[models.ContactSummary])

	if err != nil {
		return nil, fmt.Errorf("error querying database for summary: %w", err)
	}
	
	return &models.ContactWithDetails{
		Contact: contact,
		Summary: summary,
	}, nil
}

func (r *ContactRepository) GetContacts(ctx context.Context, pagination utils.Pagination, filterParams models.GetContactsRequest, companyId string) ([]models.Contact, error) {
	filterQuery := ""

	if filterParams.SearchTerm != nil {
		filterQuery += fmt.Sprintf(" AND (contact.name ILIKE '%%%s%%')", *filterParams.SearchTerm)
	}

	query := `
		SELECT
			id,
			name,
			email,
			phone,
			city,
			state,
			xero_contact_id,
			company_id
		FROM contact
		WHERE contact.company_id = $1` + filterQuery + `
		LIMIT $2 OFFSET $3
	`

	queryArgs := []interface{}{companyId, pagination.Limit, pagination.GetOffset()}
	rows, err := r.db.Query(ctx, query, queryArgs...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	contacts, err := pgx.CollectRows(rows, pgx.RowToStructByName[models.Contact])
	if err != nil {
		return nil, fmt.Errorf("error collecting contacts: %w", err)
	}

	
	return contacts, nil
}

func (r *ContactRepository) CreateContact(ctx context.Context, req models.CreateContactRequest) (*models.Contact, error) {
	columns, queryArgs, validationErr := createContactValidations(req)

	if validationErr != nil {
		return nil, validationErr
	}

	var numInputs []string
	for i := 1; i <= len(columns); i++ {
		numInputs = append(numInputs, fmt.Sprintf("$%d", i))
	}

	query := `
		INSERT INTO contact
		(` + strings.Join(columns, ", ") + `)
		VALUES (` + strings.Join(numInputs, ", ") + `)
		RETURNING id, name, email, phone, city, state, company_id;
	`
	var contact models.Contact
	err := r.db.QueryRow(ctx, query, queryArgs...).Scan(
		&contact.ID,
		&contact.Name,
		&contact.Email,
		&contact.Phone,
		&contact.City,
		&contact.State,
		&contact.CompanyID,
	)

	if err != nil {
		return nil, fmt.Errorf("error querying database: %w", err)
	}

	return &contact, nil
}

func (r *ContactRepository) AddImportedContacts(ctx context.Context, req []models.AddImportedContactRequest) ([]models.Contact, error) {
	var valuesStrings []string
	var queryArgs []interface{}

	for index, importedContact := range req {
		var inputNumbers []string

		for i := 1; i <= 9; i += 1 {
			inputNumbers = append(inputNumbers, fmt.Sprintf("$%d", (index*9)+i))
		}

		valuesStrings = append(valuesStrings, fmt.Sprintf("(%s)", strings.Join(inputNumbers, ",")))

		queryArgs = append(
			queryArgs,

			uuid.New().String(),
			importedContact.Name,
			importedContact.Email,
			importedContact.Phone,
			importedContact.City,
			importedContact.State,
			importedContact.XeroContactID,
			importedContact.CompanyID,
		)
	}
	if len(req) > 0 {
		contact, txErr := r.db.Begin(ctx)
		if txErr != nil {
			return nil, txErr
		}

		defer func() {
			if rollbackErr := contact.Rollback(ctx); rollbackErr != nil && rollbackErr != sql.ErrTxDone && txErr == nil {
				txErr = rollbackErr
			}
		}()

		query := `
			INSERT INTO contact
			(id, name, email, phone, city, state, xero_contact_id, company_id)
			VALUES ` + strings.Join(valuesStrings, ",") + `
			ON CONFLICT (xero_contact_id) DO UPDATE
			SET name=EXCLUDED.name, email=EXCLUDED.email,
				phone=EXCLUDED.phone, city=EXCLUDED.phone,
				state=EXCLUDED.state, company_id=EXCLUDED.company_id,
			RETURNING id, name, email, phone, city, state, xero_contact_id, company_id;
		`
		rows, err := r.db.Query(ctx, query, queryArgs...)
		if err != nil {
			return nil, err
		}
		defer rows.Close()

		contacts, err := pgx.CollectRows(rows, pgx.RowToStructByName[models.Contact])
		if err != nil {
			return nil, err
		}

		if commitErr := contact.Commit(ctx); commitErr != nil {
			txErr = commitErr
		}

		return contacts, txErr
	}
	return nil, nil
}

func createContactValidations(req models.CreateContactRequest) ([]string, []interface{}, error) {
	id := uuid.New().String()
	columns := []string{"id", "name", "email", "phone", "city", "state", "company_id"}
	queryArgs := []interface{}{id, req.Name, req.Email, req.Phone, req.City, req.State, req.CompanyID}

	if _, err := uuid.Parse(req.CompanyID); err != nil {
		return nil, nil, errs.BadRequest("Company ID must be a UUID")
	}

	return columns, queryArgs, nil
}

func (r *ContactRepository) GetOrCreateXeroContact(ctx context.Context, xeroContactID, name, email, phone, city, state string, companyID string) (string, error) {
	var contactID string
	query := `
		SELECT id FROM contact WHERE xero_contact_id = $1
	`
	err := r.db.QueryRow(ctx, query, xeroContactID).Scan(&contactID)
	if err == nil {
		// Contact exists, return the ID
		return contactID, nil
	} else if err != pgx.ErrNoRows {
		// Unexpected error
		return "", fmt.Errorf("error querying database: %w", err)
	}

	// Contact does not exist, insert a new one
	insertQuery := `
		INSERT INTO contact (id, xero_contact_id, name, email, phone, city, state, company_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id
	`
	newID := uuid.New()
	err = r.db.QueryRow(ctx, insertQuery, newID, xeroContactID, name, email, phone, city, state, companyID).Scan(&contactID)
	if err != nil {
		return "", fmt.Errorf("error inserting new contact: %w", err)
	}

	return contactID, nil
}

func NewContactRepository(db *pgxpool.Pool) *ContactRepository {
	return &ContactRepository{
		db,
	}
}
