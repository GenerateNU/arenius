package models

import "time"

type Company struct {
	ID             				string     		`json:"id"`
	Name           				string     		`json:"name"`
	XeroTenantID   				*string    		`json:"xero_tenant_id,omitempty"`
	LastTransactionImportTime   *time.Time 		`json:"last_transaction_import_time,omitempty"`
	LastContactImportTime 		*time.Time 		`json:"last_contact_import_time,omitempty"`
}
