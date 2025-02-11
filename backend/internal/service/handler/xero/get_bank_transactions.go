package xero

import (
	"arenius/internal/errs"
	"arenius/internal/models"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
)

func (h *Handler) GetBankTransactions(ctx *fiber.Ctx) error {
	session, err := h.sess.Get(ctx)
	if err != nil {
		return errs.BadRequest(fmt.Sprint("cannot retrieve session ", err))
	}

	accessToken, ok := session.Get("accessToken").(string)
	if !ok {
		return fmt.Errorf("missing required environment variables")
	}

	tenantId, ok := session.Get("tenantID").(string)
	if !ok {
		return fmt.Errorf("missing required environment variables")
	}

	url := os.Getenv("TRANSACTIONS_URL")

	if accessToken == "" || tenantId == "" || url == "" {
		fmt.Printf("Examine env values: accessToken=%s, tenantId=%s, url=%s\n", accessToken, tenantId, url)
		return fmt.Errorf("missing required environment variables")
	}

	// get the current company using the Xero tenant ID
	company, err := h.companyRepository.GetCompanyByXeroTenantID(ctx.Context(), tenantId)
	if err != nil {
		return err
	}

	var transactions []interface{}
	remainingTransactions := true

	pageNum := 1
	pageSize := 100

	client := &http.Client{}
	for remainingTransactions {
		paginatedUrl := fmt.Sprintf("%s?page=%d&pageSize=%d", url, pageNum, pageSize)
		pageNum += 1

		req, err := http.NewRequest("GET", paginatedUrl, nil)
		if err != nil {
			return errs.BadRequest(fmt.Sprint("invalid request: ", err))
		}

		req.Header.Set("Authorization", "Bearer "+accessToken)
		req.Header.Set("Accept", "application/json")
		req.Header.Set("Xero-tenant-id", tenantId)

		// filter the transaction results to only those after the last import time for this company
		if company.LastImportTime != nil {
			req.Header.Set("If-Modified-Since", company.LastImportTime.UTC().Format("2006-01-02T15:04:05"))
		}

		resp, err := client.Do(req)
		if err != nil {
			return errs.BadRequest(fmt.Sprint("error handling request: ", err))
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			return errs.BadRequest(fmt.Sprint("response status unsuccessful: ", err))
		}

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			return errs.BadRequest(fmt.Sprint("unable to read response body: ", err))
		}

		var response map[string]interface{}
		if err := json.Unmarshal(body, &response); err != nil {
			return errs.BadRequest(fmt.Sprint("unable to unpack response: ", err))
		}

		paginatedTransactions, ok := response["BankTransactions"].([]interface{})
		if !ok {
			return errs.BadRequest("unable to store response")
		}

		pagination, ok := response["pagination"].(map[string]interface{})
		if !ok {
			return errs.BadRequest("Invalid pagination format")
		}

		itemCount, ok := pagination["itemCount"].(float64)
		if !ok {
			return errs.BadRequest(fmt.Sprintf("Invalid Item Count value: %s", pagination["itemCount"]))
		}
		remainingTransactions = int(itemCount) == 100

		transactions = append(transactions, paginatedTransactions...)
	}

	// parse the new line items from the fetched transactions
	newLineItems, err := parseTransactions(transactions, *company)
	if err != nil {
		return err
	}

	// update company.last_imported_at to now so that we don't fetch the same transactions later
	_, err = h.companyRepository.UpdateCompanyLastImportTime(ctx.Context(), company.ID)
	if err != nil {
		return err
	}

	// send the new line items to the repository layer
	_, err = h.lineItemRepository.AddImportedLineItems(ctx.Context(), newLineItems)
	if err != nil {
		return err
	}

	return ctx.Status(fiber.StatusOK).JSON(transactions)
}

func parseTransactions(transactions []interface{}, company models.Company) ([]models.AddImportedLineItemRequest, error) {
	var newLineItems []models.AddImportedLineItemRequest
	// Build an AddImportedLineItemRequest object
	for _, transaction := range transactions {
		txMap, ok := transaction.(map[string]interface{})
		if !ok {
			return nil, errs.BadRequest("Invalid Transaction format")
		}

		var contactID string
		if txMap["Contact"] != nil {
			contactMap, ok := txMap["Contact"].(map[string]interface{})
			if !ok {
				return nil, errs.BadRequest("Invalid Contact format")
			}
			if contactMap["ContactID"] != nil {
				contactID = contactMap["ContactID"].(string)
				// TODO: make contact table that has optional field xero_contact_id
				// the value stored in contactID should be the internal contact id, not the xero contact id (it is currently the xero contact id)
			} else {
				return nil, errs.BadRequest("Missing ContactID")
			}
		}

		var currencyCode string
		if txMap["CurrencyCode"] != nil {
			currencyCode = txMap["CurrencyCode"].(string)
		} else {
			currencyCode = "USD"
		}

		var date time.Time
		var err error
		if txMap["DateString"] != nil {
			date, err = time.Parse("2006-01-02T15:04:05", txMap["DateString"].(string))
			if err != nil {
				return nil, errs.BadRequest(fmt.Sprintf("Error parsing date: %s", err))
			}
		} else {
			return nil, errs.BadRequest("Missing Date string")
		}

		if txMap["LineItems"] != nil {
			lineItemsArray, ok := txMap["LineItems"].([]interface{})
			if !ok {
				return nil, errs.BadRequest("Invalid LineItems format")
			}

			for _, rawLineItem := range lineItemsArray {
				lineItem, ok := rawLineItem.(map[string]interface{})
				if !ok {
					return nil, errs.BadRequest("Invalid LineItem format")
				}
				var newLineItem models.AddImportedLineItemRequest
				newLineItem.CompanyID = company.ID
				newLineItem.CurrencyCode = currencyCode
				newLineItem.ContactID = contactID
				newLineItem.Date = date

				if lineItem["LineItemID"] != nil {
					newLineItem.XeroLineItemID = lineItem["LineItemID"].(string)
				} else {
					return nil, errs.BadRequest("Missing LineItemID")
				}

				if lineItem["Description"] != nil {
					newLineItem.Description = lineItem["Description"].(string)
				} else {
					return nil, errs.BadRequest("Missing Description")
				}

				if lineItem["Quantity"] != nil {
					newLineItem.Quantity = lineItem["Quantity"].(float64)
				} else {
					return nil, errs.BadRequest("Missing Quantity")
				}

				if lineItem["UnitAmount"] != nil {
					newLineItem.UnitAmount = lineItem["UnitAmount"].(float64)
				} else {
					return nil, errs.BadRequest("Missing UnitAmount")
				}

				newLineItems = append(newLineItems, newLineItem)
			}
		}

	}

	return newLineItems, nil
}
