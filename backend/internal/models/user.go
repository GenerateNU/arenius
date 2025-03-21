package models

type User struct {
	ID           string  `json:"user"`
	FirstName    *string `json:"first_name,omitempty"`
	LastName     *string `json:"last_name,omitempty"`
	CompanyID    *string `json:"company_id,omitempty"`
	RefreshToken *string `json:"refresh_token,omitempty"`
	TenantID     *string `json:"tenant_id,omitempty"`
	City         *string `json:"city,omitempty"`
	State        *string `json:"state,omitempty"`
	PhotoUrl     *string `json:"photo_url,omitempty"`
}

type UpdateUserProfileRequest struct {
	FirstName *string `json:"first_name,omitempty"`
	LastName  *string `json:"last_name,omitempty"`
	City      *string `json:"city,omitempty"`
	State     *string `json:"state,omitempty"`
	PhotoUrl  *string `json:"photo_url,omitempty"`
}
