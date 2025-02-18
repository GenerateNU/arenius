package models

type User struct {
	ID           string  `json:"id"`
	FirstName    *string `json:"first_name,omitempty"`
	LastName     *string `json:"last_name,omitempty"`
	CompanyID    *string `json:"company_id,omitempty"`
	RefreshToken *string `json:"refresh_token,omitempty"`
	TenantID     *string `json:"tenant_id,omitempty"`
}
