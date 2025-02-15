package models

type Contact struct {
	ID             string     `json:"id"`
	Name           string     `json:"name"`
	Email		   string	  `json:"email"`
	Phone		   string	  `json:"phone"`
	City		   string	  `json:"city"`
	State	   	   string	  `json:"state"`
	XeroContactID  *string    `json:"xero_contact_id,omitempty"`
	CompanyID	   string	  `json:"company_id"`
}
