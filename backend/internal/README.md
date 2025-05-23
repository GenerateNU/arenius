# API Documentation

## Health Check

GET `/health`
Returns 200 OK if the server is running.

## Auth

POST `/login`
Login for user, returns access token and user information.

```go
Body Parameters:
- `email` (string)
- `password` (string)
Example:
- URL: `http://127.0.0.1:8080/auth/login`
- Body: {
"email": "croft.z@husky.neu.edu",
"password": "huskyaccount",
}
```

POST `/signup`
Sign up for user, returns access token and user info.

```go
Body Parameters:
- `email` (string)
- `password` (string)
- `first_name` (string, optional)
- `last_name` (string, optional)
Example:
- URL: `http://127.0.0.1:8080/auth/signup`
- Body: {
    "email": "croft.z@husky.neu.edu",
    "password": "someboguspassword",
    "first_name": "zachie",
    "last_name": "croft",
}
```

POST `/forgot-password`
Does forgot password for an email, sends an email with a reset link.

```go
Body Parameters:
- `email` (string)
```

POST `/reset-password`
Resets a password for the logged in account

```go
Body Parameters:
- `password` (string)
```

POST `/sign-out`
Signs out the user based on cookies

DELETE `/delete-account`
Deletes the given account

```go
Query Parameters:
- `userId` (string)
```

## User

GET `/user`
Gets a user by the User ID

```go
Path Parameters:
- `id` (string)
Example:
- URL: `http://127.0.0.1:8080/user/00d3c5cc-e7f5-4dde-97de-1f132acc4399`
```

PATCH `/user`
Updates a user's profile  

```go
Path Parameters:
- `id` (string)
Body Parameters:
- `first_name` (string, optional)
- `last_name` (string, optional)
- `city` (string, optional)
- `state` (string, optional)
- `photo_url` (string, optional)
Example:
- URL: `http://127.0.0.1:8080/user/00f45794-33cb-4ef6-96b6-3f2d994d54b2`
- Parameters: {
    "first_name": "Eddie",
    "city": "Neward",
    "state": "New Jersey poop emoji"
}
```

## Line Item

GET `/line-item`
Gets all line items, filtered by a variety of query parameters.
SearchTerm looks for matching line item descriptions, case insensitive.

Pagination defaults to page 1, limit 10.

Also returns `total` and `count`, where total is the total number of line items that fit those query parameters, ignoring pagination, and count is the number of line items returned in this request.

`reconcilation_status` should be one of: ["reconciled", "unreconciled", "recommended", "offset"]

```go
Query Parameters:
- `company_id` (string, optional)
- `reconciliation_status` (string, optional)
- `before_date` (time.Time, optional)
- `after_date` (time.Time, optional)
- `scope` (int, optional)
- `emission_factor` (string, optional)
- `search_term` (string, optional)
- `min_price` (float64, optional)
- `max_price` (float64, optional)
- `contact_id` (string, optional)
- `limit` (int, optional)
- `page` (int, optional)
Example:
- URL: `http://127.0.0.1:8080/line-item?scope=2&limit=50&page=2`
```

PATCH `/line-item`
Reconciles the line item with an emissions factor, scope and optionally a contact ID.

```go
Path Parameters:
- `id` (string)
Body Parameters:
- `emission-factor` (string)
- `scope`: (string)
- `contact_id` (string, optional)
Example:
- URL: `http://127.0.0.1:8080/line-item/0651d33f-e9f5-4df4-a1b4-155c0e6cceff`
- Parameters: {
    "emission_factor": "consumer_goods-type_footwear",
    "scope": 2,
    "contact_id": "4e689492-7920-4149-94e8-240b12f25c2e"
}
```

Post `/line-item`
Creates a line item.

```go
Body Parameters:
- `description` (string): The description for a line item, non-empty
- `total_amount` (float64): The price, >= 0
- `company_id` (string): The ID of the associated company, UUID
- `contact_id` (string): The ID of the associated contact, UUID
- `emission_factor` (string, optional): The emission factor as known by Climatiq
- `amount` (float64, optional): The amount of the emission factor, >= 0
- `unit` (string, optional): The unit of the emission factor
- `co2` (float64, optional): The amount of CO2, >= 0
- `scope` (int, optional): The scope of the line item
- `co2_unit` (string, optional): The unit of CO2
Example:
- URL: `http://127.0.0.1:8080/line-item`
- Parameters: {
    "description": "Consumer Goods - Footwear",
    "total_amount": 120.50,
    "company_id": "1339d26e-8e6b-43e6-aa56-470b3985f3b1",
    "contact_id": "4e689492-7920-4149-94e8-240b12f25c2e",
    "emission_factor": "consumer_goods-type_footwear",
    "scope": 2,
    "co2_unit": "kg"
}
```

Patch `/line-item/batch`
Updates the scope and/or emissions factor on multiple line items

```go
Body Parameters:
- `line_item_ids` ([]uuid.UUID)
- `scope` (int, optional)
- `emissions_factor_id` (string, optional)
Example:
- URL: `http://127.0.0.1:8080/line-item/batch`
- Parameters: {
    "line_item_ids": ["0651d33f-e9f5-4df4-a1b4-155c0e6cceff",        "2c67a94e-e665-46a9-86a0-907fb768b01d"],
    "scope": 2,
    "emissions_factor_id": "consumer_goods-type_footwear"
}
```

Patch `/line-item/batch/offset`
Updates the carbon offset on multiple line items

```go
Body Parameters:
- `line_item_ids` ([]uuid.UUID)
- `scope` (int, optional)
- `co2` (string, optional)
- `co2_unit` (string, optional)
Example:
- URL: `http://127.0.0.1:8080/line-item/batch/offset`
- Parameters: {
    "line_item_ids": ["0651d33f-e9f5-4df4-a1b4-155c0e6cceff",        "2c67a94e-e665-46a9-86a0-907fb768b01d"],
    "scope": 0,
    "co2": 500
}
```

Patch `/line-item//offset/:id`
Updates the carbon offset on multiple line items

```go
Path Parameters:
- `id` (string)
Body Parameters:
- `scope` (int, optional)
- `co2` (string, optional)
- `co2_unit` (string, optional)
- `contact_id` (string, optional)
Example:
- URL: `http://127.0.0.1:8080/line-item/offset/0651d33f-e9f5-4df4-a1b4-155c0e6cceff`
- Parameters: {
    "scope": 0,
    "co2": 500
}
```

## Contacts

GET `/contact/:contactId`
Get a contact with details object, which includes the contact as well as total emissions, total amount spent, and total transactions.

```go
Path Parameters:
- `contactId`: (string)
Example:
- URL: `http://127.0.0.1:8080/contact/4e689492-7920-4149-94e8-240b12f25c2e`
```

GET `/contact/company/:companyId`
Get all contact objects associated with a company with pagination. Default pagination options are page 1 and limit 10.

SearchTerm looks for matching contact names, case insensitive.

Pagination is ignored if `unpaginated` is true (all contacts are returned)

Also returns `total` and `count`, where total is the total number of contacts that fit those query parameters, ignoring pagination, and count is the number of contacts returned in this request.

```go
Path Parameters:
- `companyId`: (string)
Query Parameters:
- `page`: (int, optional)
- `limit`: (int, optional)
- `search_term`: (string, optional)
- `unpaginated`: (bool, optional)
Example:
- URL: `http://127.0.0.1:8080/contact/company/1339d26e-8e6b-43e6-aa56-470b3985f3b1?page=2&search_term=abc`
```

PATCH `/contact/:contactId`
Update fields of a contact manually

```go
Body Parameters:
- `name` (string, optional)
- `email` (string, optional)
- `phone` (string, optional)
- `city` (string, optional)
- `state` (string, optional)
- `xero_contact_id` (string, optional)
- `company_id` (string, optional)
Example:
- URL: `http://127.0.0.1:8080/contact/06769be2-7a0b-4640-aa6d-9fcecfbc988c`
- Parameters: {
    "name": "Zachie Croft",
    "email": "croft.z@husky.neu.edu",
    "phone": "123-456-7890"
}


POST `/contact`
Create a new contact manually

```go
Body Parameters:
- `name` (string)
- `email` (string)
- `phone` (string)
- `city` (string)
- `state` (string)
- `xero_contact_id` (string, optional)
- `company_id` (string)
Example:
- URL: `http://127.0.0.1:8080/contact`
- Parameters: {
    "name": "Zachie Croft",
    "email": "croft.z@husky.neu.edu",
    "phone": "123-456-7890",
    "city": "Boston",
    "state": "MA",
    "company_id": "1339d26e-8e6b-43e6-aa56-470b3985f3b1"
}
```

## Emissions Factors

GET `/emissions-factor/:companyId`
Returns all emissions factors, structured as a list of categories, each with a name and its list of emission factors. The first category is the company's "favorites"

```go
Query Parameters:
- `company_id` (string)
Example:
- URL: `http://127.0.0.1:8080/emissions-factor/1339d26e-8e6b-43e6-aa56-470b3985f3b1`
```

PATCH `/emissions-factor/populate`
Populates emissions factors table

## Climatiq

GET `/climatiq`

## Summaries

GET `/summary/gross` - provides the breakdown of total emissions per month by scope, for the given date range, as well as a cumulative total emissions for all line items for the range.

If either start date or end date are missing, then the date range will default to 3 months ago - today
```go

- Query Parameters:
        - `company_id`: Company ID
        - `start_date`: Start of the date range
        - `end_date`: End of the date range
    - Example:
        - URL: `http://localhost:8080/summary/gross?company_id=86afab0a-443f-4d9b-89d9-1f19a7ea6a14&start_date=2024-11-01T00:00:00Z&end_date=2025-03-11T00:00:00Z`
```

GET `/summary/contact/emissions` - provides the total emissions for each contact assigned to the given companies line items within the given date range.

If either start date or end date are missing, then the date range will default to 3 months ago - today
```go

- Query Parameters:
        - `company_id`: Company ID
        - `start_date`: Start of the date range
        - `end_date`: End of the date range
    - Example:
        - URL: `http://localhost:8080/summary/contact/emissions?company_id=86afab0a-443f-4d9b-89d9-1f19a7ea6a14&start_date=2024-11-01T00:00:00Z&end_date=2025-03-11T00:00:00Z`
```

GET `/summary/top-emissions` - provides the top 5 emissions for the company within the provided date range

If either start date or end date are missing, then the date range will default to 3 months ago - today
```go

- Query Parameters:
        - `company_id`: Company ID
        - `start_date`: Start of the date range
        - `end_date`: End of the date range
    - Example:
        - URL: `http://localhost:8080/summary/top-emissions?company_id=86afab0a-443f-4d9b-89d9-1f19a7ea6a14&start_date=2024-11-01T00:00:00Z&end_date=2025-03-11T00:00:00Z`
```

## Carbon

POST `carbon-offset/create`
Creates a new carbon offset record.

```go
Body Parameters:
- `carbon_amount_kg` (float64)
- `company_id` (uuid.UUID)
- `source` (string)
- `purchase_date` (time.Time)
Example:
- URL: `http://127.0.0.1:8080/carbon-offset/create`
- Parameters: {
    "carbon_amount_kg": 500,
    "company_id": "0a67f5d3-88b6-4e8f-aac0-5137b29917fd",
    "source": "https://example-offset-provider.com",
    "purchase_date": "2024-02-08T00:00:00Z"
}
```

POST `carbon-offset/batch`
Creates multiple carbon offset records at once.

```go
Body Parameters:
- `carbon_offsets` ([]CreateCarbonOffsetRequest)
Example:
- URL: `http://127.0.0.1:8080/carbon-offset/batch`
- Parameters: [
    {
        "carbon_amount_kg": 500,
        "company_id": "0a67f5d3-88b6-4e8f-aac0-5137b29917fd",
        "source": "https://example-offset-provider.com",
        "purchase_date": "2024-02-08T00:00:00Z"
    },
    {
        "carbon_amount_kg": 500,
        "company_id": "0a67f5d3-88b6-4e8f-aac0-5137b29917fd",
        "source": "https://example-offset-provider.com",
        "purchase_date": "2024-02-08T00:00:00Z"
    },
    {
        "carbon_amount_kg": 500,
        "company_id": "0a67f5d3-88b6-4e8f-aac0-5137b29917fd",
        "source": "https://example-offset-provider.com",
        "purchase_date": "2024-02-08T00:00:00Z"
    }
]
```

## Xero Bank Transactions

POST `/sync-transactions/:tenantId`
Syncs transactions for a given Xero tenant if a tenant ID is given, otherwise syncs transactions for all the tenants.

```go
Requires:
- Session Access Token (stored through /xero/auth)
- Session Tenant ID (stored through /xero/auth)
Query Parameters:
- `tenantId` (string, optional)
Response:
- List of dictionaries containing transaction information
Example:
- URL: `http://127.0.0.1::8080/sync-transactions?tenantId=59ab8a8d-9003-47e8-ad64-6a843d1e1168`
```
