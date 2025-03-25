package xero

import (
	"arenius/internal/errs"
	"arenius/internal/models"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/oauth2"
)

func (h *Handler) syncCompanyTransactions(ctx *fiber.Ctx, company models.Tenant) error {
	refreshToken := ""
	if company.RefreshToken != nil {
		refreshToken = *company.RefreshToken
	}

	token := &oauth2.Token{
		RefreshToken: refreshToken,
	}

	tenantId := company.XeroTenantID
	url := "https://api.xero.com/api.xro/2.0/BankTransactions"

	tokenSource := h.config.OAuth2Config.TokenSource(ctx.Context(), token)
	newToken, err := tokenSource.Token()
	if err != nil {
		fmt.Println(err)
		return ctx.Status(fiber.StatusInternalServerError).SendString("Failed to refresh access token")
	}

	accessToken := newToken.AccessToken
	e := h.UserRepository.SetUserCredentials(ctx.Context(), *company.UserID, company.ID, newToken.RefreshToken, *company.XeroTenantID)
	if e != nil {
		return ctx.Status(fiber.StatusInternalServerError).SendString("Failed to update user credentials")
	}

	if accessToken == "" || *tenantId == "" || url == "" {
		return fmt.Errorf("missing required environment variables")
	}

	var transactions []map[string]interface{}
	remainingTransactions := true
	pageNum := 1
	pageSize := 100
	client := &http.Client{}

	for remainingTransactions {
		paginatedUrl := fmt.Sprintf("%s?page=%d&pageSize=%d", url, pageNum, pageSize)
		pageNum++

		req, err := http.NewRequest("GET", paginatedUrl, nil)
		if err != nil {
			return errs.BadRequest(fmt.Sprintf("invalid request: %s", err))
		}

		req.Header.Set("Authorization", "Bearer "+accessToken)
		req.Header.Set("Accept", "application/json")
		req.Header.Set("Xero-tenant-id", *tenantId)

		if company.LastTransactionImportTime != nil {
			req.Header.Set("If-Modified-Since", company.LastTransactionImportTime.UTC().Format("2006-01-02T15:04:05"))
		}

		resp, err := client.Do(req)
		if err != nil {
			log.Printf("HTTP request failed: %v", err)
			return err
		}
		defer resp.Body.Close()

		body, _ := io.ReadAll(resp.Body) // Read response body
		if resp.StatusCode != http.StatusOK {
			log.Printf("HTTP error: %d response body: %s", resp.StatusCode, string(body))
			return fmt.Errorf("HTTP error: %d - %s", resp.StatusCode, string(body))
		}

		var response map[string]interface{}
		if err := json.Unmarshal(body, &response); err != nil {
			return errs.BadRequest(fmt.Sprintf("unable to unpack response: %s", err))
		}

		paginatedTransactions, ok := response["BankTransactions"].([]interface{})
		if !ok {
			return errs.BadRequest("unable to store response")
		}

		for _, transaction := range paginatedTransactions {
			txMap, ok := transaction.(map[string]interface{})
			if !ok {
				return errs.BadRequest("Invalid Transaction format")
			}
			transactions = append(transactions, txMap)
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
	}

	// Parse transactions and filter out duplicates
	newLineItems, err := h.parseTenantTransactions(ctx.Context(), transactions, company)
	if err != nil {
		fmt.Println("Error parsing transactions:", err)
		return err
	}

	// Insert only if there are new transactions
	if len(newLineItems) > 0 {
		_, err = h.lineItemRepository.AddImportedLineItems(ctx.Context(), newLineItems)
		if err != nil {
			fmt.Println("Error adding line items:", err)
			return err
		}

		// Update last import time
		_, err = h.companyRepository.UpdateCompanyLastTransactionImportTime(ctx.Context(), company.ID)
		if err != nil {
			fmt.Println("Error updating last import time:", err)
			return err
		}
	}

	return nil
}

func (h *Handler) parseTenantTransactions(ctx context.Context, transactions []map[string]interface{}, company models.Tenant) ([]models.AddImportedLineItemRequest, error) {
	var newLineItems []models.AddImportedLineItemRequest
	// Build an AddImportedLineItemRequest object
	for _, txMap := range transactions {
		var contactID string
		var e error
		var contactName string
		if txMap["Contact"] != nil {
			contactMap, ok := txMap["Contact"].(map[string]interface{})
			if !ok {
				return nil, errs.BadRequest("Invalid Contact format")
			}
			if contactMap["ContactID"] != nil {
				xeroContactID := contactMap["ContactID"].(string)

				contactName := ""
				if contactMap["Name"] != nil {
					contactName = contactMap["Name"].(string)
				}
				email := ""
				if contactMap["EmailAddress"] != nil {
					email = contactMap["EmailAddress"].(string)
				}
				phone := ""
				if contactMap["Phones"] != nil {
					phonesArray, ok := contactMap["Phones"].([]interface{})
					if ok && len(phonesArray) > 0 {
						phoneMap, _ := phonesArray[0].(map[string]interface{})
						if phoneMap["PhoneNumber"] != nil {
							phone = phoneMap["PhoneNumber"].(string)
						}
					}
				}
				city, state := "", ""
				if contactMap["Addresses"] != nil {
					addressesArray, ok := contactMap["Addresses"].([]interface{})
					if ok && len(addressesArray) > 0 {
						addressMap, _ := addressesArray[0].(map[string]interface{})
						if addressMap["City"] != nil {
							city = addressMap["City"].(string)
						}
						if addressMap["Region"] != nil {
							state = addressMap["Region"].(string)
						}
					}
				}

				contactID, e = h.contactRepository.GetOrCreateXeroContact(ctx, xeroContactID, contactName, email, phone, city, state, company.ID)
				if e != nil {
					return nil, errs.BadRequest(fmt.Sprintf("Error getting or creating contact: %s", e))
				}
			} else {
				return nil, errs.BadRequest("Missing ContactID")
			}

			if contactMap["Name"] != nil {
				contactName = contactMap["Name"].(string)
			}
		}

		var currencyCode string
		if txMap["CurrencyCode"] != nil {
			currencyCode = txMap["CurrencyCode"].(string)
		} else {
			currencyCode = "USD"
		}

		var transactionType string
		if txMap["Type"] != nil {
			transactionType = txMap["Type"].(string)
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

				if lineItem["Description"] == nil || lineItem["Description"] == "" {
					// both Type and Contact.Name are required on POST
					newLineItem.Description = fmt.Sprintf("%s to %s", transactionType, contactName)
				} else {
					newLineItem.Description = lineItem["Description"].(string)
				}

				if lineItem["Quantity"] != nil || lineItem["UnitAmount"] != nil {
					newLineItem.TotalAmount = lineItem["Quantity"].(float64) * lineItem["UnitAmount"].(float64)
				} else {
					return nil, errs.BadRequest("Missing Quantity or UnitAmount")
				}

				newLineItems = append(newLineItems, newLineItem)
			}
		}

	}

	return newLineItems, nil
}
