package models

import "time"

type Contact struct {
	ID            string    `json:"id"`
	Name          string    `json:"name"`
	Email         string    `json:"email"`
	Phone         string    `json:"phone"`
	City          string    `json:"city"`
	State         string    `json:"state"`
	XeroContactID *string   `json:"xero_contact_id,omitempty"`
	CompanyID     string    `json:"company_id"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type AddImportedContactRequest struct {
	Name          string  `json:"name"`
	Email         string  `json:"email"`
	Phone         string  `json:"phone"`
	City          string  `json:"city"`
	State         string  `json:"state"`
	XeroContactID *string `json:"xero_contact_id,omitempty"`
	CompanyID     string  `json:"company_id"`
}

type GetContactsRequest struct {
	SearchTerm  *string `query:"search_term"`
	Unpaginated *bool   `query:"unpaginated"`
}

type GetContactsResponse struct {
	Total    int       `json:"total"`
	Count    int       `json:"count"`
	Contacts []Contact `json:"contacts"`
}

type CreateContactRequest struct {
	Name          string  `json:"name"`
	Email         string  `json:"email"`
	Phone         string  `json:"phone"`
	City          string  `json:"city"`
	State         string  `json:"state"`
	XeroContactID *string `json:"xero_contact_id,omitempty"`
	CompanyID     string  `json:"company_id"`
}

type ContactSummary struct {
	TotalSpent              float64 `json:"total_spent"`
	TotalTransactions       int     `json:"total_transactions"`
	TotalOffsetTransactions int     `json:"total_offset_transactions"`
	TotalEmissions          float64 `json:"total_emissions"`
	TotalOffset             float64 `json:"total_offset"`
}

type ContactWithDetails struct {
	Contact Contact        `json:"contact"`
	Summary ContactSummary `json:"summary"`
}
