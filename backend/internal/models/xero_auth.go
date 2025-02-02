package models

import (
	"github.com/google/uuid"
)

type XeroCredentials struct {
	ID           uuid.UUID `json:"id"`
	AccessToken  uuid.UUID `json:"access_token"`
	RefreshToken uuid.UUID `json:"refresh_token"`
	TenantID     uuid.UUID `json:"tenant_id"`
}
