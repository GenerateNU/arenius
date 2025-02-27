# API Documentation

## Health Check

- GET `/health`
  - Returns 200 OK if the server is running.

## Transactions

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

## Carbon

## Line Item

GET `/line-item`

```go
    - Query Parameters:
        CompanyID            *string    `query:"company_id"`
        ReconciliationStatus *bool      `query:"reconciliation_status"`
        BeforeDate           *time.Time `query:"before_date"`
        AfterDate            *time.Time `query:"after_date"`
        Scope                *int       `query:"scope"`
        EmissionFactor       *string    `query:"emission_factor"`
        SearchTerm           *string    `query:"search_term"`
        Page                 int        `query:"page"`
     Limit                int        `query:"limit"`

```

SearchTerm looks for matching line item descriptions, case insensitive.

PATCH `/line-item`

```go
    - Body Parameters:
        - `emission-factor`: Name of the emissions factor
        - `scope`: Scope, optional 
        - `contact_id`: Contact ID, optional
    - Path Parameters:
        - `:id`: The ID of the line item
    - Example:
        - URL: `http://127.0.0.1:8080/line-item/0651d33f-e9f5-4df4-a1b4-155c0e6cceff`
        - Parameters: {
            "emission_factor": "consumer_goods-type_footwear",
            "scope": 2, 
            "contact_id": "33333333-3333-3333-3333-333333333333"
        }
```

Post `/line-item`

```go
    - Body Parameters (*type) indicates an optional field
        Description    string   `json:"description"`               // the description for a line item, non-empty
        TotalAmount    float64  `json:"total_amount"`              // the price, >= 0
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

Patch `/lint-item\batch`
    - Allows you to update the scope and/or emissions factor on multiple line items

```go
    - Body Parameters:
        LineItems           []uuid.UUID     `json:"line_item_ids"`
        Scope               *int            `json:"scope"`
        EmissionFactorId    *string         `json:"emissions_factor_id"`
```

## Climatiq

PATCH `climatiq/estimate`
    - Provides Carbon estimates for the given line items and updates the db based on Unit being Money
    - Body Parameters:
        List of Line Items

```go
    Line Item:
        ID               string    `json:"id"` //Required
        XeroLineItemID   *string   `json:"xero_line_item_id"` //Optional
        Description      string    `json:"description"` //Optional
        TotalAmount      float64   `json:"total_amount"` //Required
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

## Emissions Factors

GET `/emissions-factor/:companyId`
    - returns all emissions factors, structured as a list of categories, each with a name and its list of emission factors. The first category is the company's "favorites"

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

## Xero Bank Transactions

GET `/bank-transactions`

- provides a list of transactions specific to an organization including line items, currently configured for demo data

 ``` go
- Body Params:
 - Session Access Token (stored through /xero/auth)
 - Session Tenant ID (stored through /xero/auth)
- Response:
 - list of dictionaries contianing transaction information
```

## Xero Credentials

GET `credentials/get`

- retrieves the latest access token, refresh token, and tenant id from Xero authentication
- response: json object of tokens

POST `credentials/create`

- adds a newly generated access token, refresh token, and tenant id to be used for continuous authentication
- BODY PARAMS:
  {
      "company_id": {uuid},
      "access_token": {uuid},
      "refresh_token": {uuid},
      "tenant_id": {uuid}
  }
- Response:
- new authentication credentials row in Xero Credentials table

## Summaries

GET `/summary/gross`
    - provides the breakdown of total emissions per month by scope, for the previous `month_duration` months, as well as a cumulative total emissions for all line items for all time.

```go
    - Body Parameters:
        - `month_duration`: Number of months to summarize
        - `company_id`: Company whose line items are being summarized
```

## Auth

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
        - `first_name` (optional)
        - `last_name` (optional)
```

## Contacts

GET `/contact/:contactId`
    - get a contact with details object, which includes the contact as well as total emissions, total amount spent, and total transactions

GET `/contact/company/:companyId`
    - get all contact objects associated with a company

POST `/contact`
    - create a new contact manually

```go
    - Body Parameters:
        - `name`
        - `email`
        - `phone`
        - `city`
        - `state`
        - `company_id`
```
