package xero

import (
	"arenius/internal/errs"
	"arenius/internal/models"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

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

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return errs.BadRequest(fmt.Sprint("invalid request: ", err))
	}

	req.Header.Set("Authorization", "Bearer "+accessToken)
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Xero-tenant-id", tenantId)

	// get the current company using the Xero tenant ID
	// TODO: how?

	// req.Header.Set("If-Modified-Since", company.LastImportTime)

	client := &http.Client{}
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

	transactions, ok := response["BankTransactions"].([]interface{})
	if !ok {
		return errs.BadRequest(fmt.Sprint("unable to store response: ", err))
	}

	// get the current company ID using the Xero tenant ID:

	// TODO send it to the repository layer (how?)

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

		if txMap["LineItems"] != nil {
			// TODO: these are currently missing from response?
			lineItemsArray, ok := txMap["LineItems"].([]map[string]interface{})
			if !ok {
				return nil, errs.BadRequest("Invalid LineItems format")
			}

			for _, lineItem := range lineItemsArray {
				var newLineItem models.AddImportedLineItemRequest
				// newLineItem.CompanyID = company.ID TODO
				newLineItem.CompanyID = "0a67f5d3-88b6-4e8f-aac0-5137b29917fd"
				newLineItem.CurrencyCode = currencyCode
				newLineItem.ContactID = contactID

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
