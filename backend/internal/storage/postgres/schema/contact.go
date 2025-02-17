package schema

import (
	"arenius/internal/models"
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

func NewContactRepository(db *pgxpool.Pool) *ContactRepository {
	return &ContactRepository{
		db,
	}
}