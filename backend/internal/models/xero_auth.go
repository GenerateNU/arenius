package models

import (
	"github.com/google/uuid"
)

type XeroCredentials struct {
	CompanyID    uuid.UUID `json:"company_id"`
	RefreshToken string    `json:"refresh_token"`
	TenantID     uuid.UUID `json:"tenant_id"`
}
