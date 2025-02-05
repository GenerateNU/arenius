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

PATCH `/line-item`

```go
    - Body Parameters:
        - `emission-factor`: Name of the emissions factor
        - `amount`: Price
        - `unit`: Unit of the emissions factor
    - Path Parameters:
        - `:id`: The ID of the line item
    - Example:
        - URL: `http://127.0.0.1:8080/line-item/1`
        - Parameters: {"emission_factor": "factor_UPDATE",
                       "amount": 69,
                       "unit": "gigabytes"
                      }
```

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

GET `/emissions-factor`
    - returns all emissions factors, structured as a list of categories, each with a name and its list of emission factors.

PATCH `/emissions-factor/populate`
    - populates emissions factors table

```go

EmissionsFactor:
    Id            string `json:"id"`
 ActivityId    string `json:"activity_id"`
 Name          string `json:"name"`
 Description   string `json:"description"`
 Unit          string `json:"unit"`
 UnitType      string `json:"unit_type"`
 Year          int    `json:"year"`
 Region        string `json:"region"`
 Category      string `json:"category"`
 Source        string `json:"source"`
 SourceDataset string `json:"source_dataset"`

Category:
 Name             string            `json:"name"`
 EmissionsFactors []EmissionsFactor `json:"emissions_factors"`

```

# Xero Bank Transactions

GET `/bank-transactions`

- provides a list of transactions specific to an organization including line items, currently configured for demo data

 ``` go
- Body Params:
 - Session Access Token (stored through /xero/auth)
 - Session Tenant ID (stored through /xero/auth)
- Response:
 - list of dictionaries contianing transaction information
```

# Summaries

GET `/summary/gross`
    - provides the breakdown of total emissions per month by scope, for the previous `month_duration` months, as well as a cumulative total emissions for all line items for all time.

```go
    - Body Parameters:
        - `month_duration`: Number of months to summarize
        - `company_id`: Company whose line items are being summarized
```

# Auth

POST `/auth/login`
    - login for user, returns access token and user info

```go
    - Body Parameters:
        - `email`
        - `password`
```

POST `/auth/signup`
    - signup for user, returns access token and user info

```go
    - Body Parameters:
        - `email`
        - `password`
```
