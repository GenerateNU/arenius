package models

import "time"

type Company struct {
	ID             string     `json:"id"`
	Name           string     `json:"name"`
	XeroTenantID   *string    `json:"xero_tenant_id,omitempty"`
	LastImportTime *time.Time `json:"last_import_time,omitempty"`
}
