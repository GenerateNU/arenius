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