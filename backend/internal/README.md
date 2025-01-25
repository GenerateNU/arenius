## API Documentation

# Health Check

- GET `/health`
  - Returns 200 OK if the server is running.

# Transactions

POST `/transaction`

```go
    - Body Parameters:

            CompanyID         string    `json:"company_id"`
            BankTransactionID string    `json:"bank_transaction_id"`
            ContactID         int       `json:"contact_id"`
            SubTotal          float64   `json:"sub_total"`
            TotalTax          float64   `json:"total_tax"`
            Total             float64   `json:"total"`
            CurrencyCode      string    `json:"currency_code"`
            CreatedAt         time.Time `json:"created_at"`
            ImportedAt        time.Time `json:"imported_at"`

    - Query Parameters:
```

# Carbon

# Line Item
Post `/line-item`
```go
    - Body Parameters (*type) indicates an optional field
        Description    string   `json:"description"`               // the description for a line item, non-empty
        Quantity       float64  `json:"quantity"`                  // the quantity of items purchased, >= 0
        UnitAmount     float64  `json:"unit_amount"`               // the price, >= 0
        CompanyID      string   `json:"company_id"`                // the id of the associated company, uuid
        ContactID      string   `json:"contact_id"`                // the id of the associated contact, uuid
        EmissionFactor *string  `json:"emission_factor,omitempty"` // the emission factor as known by climatiq
        Amount         *float64 `json:"amount,omitempty"`          // the amount of the emission factor, >= 0
        Unit           *string  `json:"unit,omitempty"`            // the unit of the emission factor
        CO2            *float64 `json:"co2,omitempty"`             // the amount of CO2, >= 0
        Scope          *int     `json:"scope,omitempty"`           // the scope of the line-item
        CO2Unit        *string  `json:"co2_unit,omitempty"`        // the unit of CO2
```


GET `/line-item` 
```go
    - Body Parameters:
        CompanyID            *string    `json:"company_id"`
        Date                 *time.Time `json:"date"`
        ReconciliationStatus *bool      `json:"reconciliation_status"`
    - Query Parameters:
        Page  int `query:"page"`
	    Limit int `query:"limit"`

```

# Climatiq

PATCH `climatiq/estimate`
    - Provides Carbon estimates for the given line items and updates the db based on Unit being Money

    - Body Parameters:
        List of Line Items

```go
    Line Item:
        ID               string    `json:"id"` //Required
        XeroLineItemID   *string   `json:"xero_line_item_id"` //Optional
        Description      string    `json:"description"` //Optional
        Quantity         float64   `json:"quantity"` //Required
        UnitAmount       float64   `json:"unit_amount"` //Required
        CompanyID        string    `json:"company_id"` //Optional
        ContactID        string    `json:"contact_id"` //Optional
        Date             time.Time `json:"date"` //Optional
        CurrencyCode     string    `json:"currency_code"` //Required
        EmissionFactorId *string   `json:"emission_factor_id"` //Required
        Amount           *float64  `json:"amount"` //Optional
        Unit             *string   `json:"unit"` //Optional
        CO2              *float64  `json:"co2"` //Optional
        Scope            *int      `json:"scope"` //Optional
        CO2Unit          *string   `json:"co2_unit"` //Optional
```

# Emissions Factors

PATCH `/emissions-factor/populate`
    - populates emissions factors table
