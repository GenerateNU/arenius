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

func (r *LineItemRepository) GetContacts(ctx context.Context, pagination utils.Pagination, companyId string) ([]models.Contact, error) {
	query := `
		SELECT *
		FROM contact
		WHERE contact.company_id = $1
		LIMIT $2 OFFSET $3
	`

	queryArgs := []interface{}{companyId, pagination.Limit, pagination.GetOffset()}
	rows, err := r.db.Query(ctx, query, queryArgs...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var contacts []models.Contact
	for rows.Next() {
		var contact models.Contact
		if err := rows.Scan(
			&contact.ID,
			&contact.Name,
			&contact.Email,
			&contact.Phone,
			&contact.City,
			&contact.State,
			&contact.XeroContactID,
			&contact.CompanyID,
		); err != nil {
			return nil, err
		}
		contacts = append(contacts, contact)
	}

	if rowsErr := rows.Err(); rowsErr != nil {
		return nil, fmt.Errorf("error iterating over contact rows: %w", rowsErr)
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

func (r *LineItemRepository) AddImportedContacts(ctx context.Context, req []models.AddImportedContactRequest) ([]models.Contact, error) {
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

func NewContactRepository(db *pgxpool.Pool) *ContactRepository {
	return &ContactRepository{
		db,
	}
}