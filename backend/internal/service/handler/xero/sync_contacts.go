package xero

import (
	"arenius/internal/errs"
	"arenius/internal/models"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/oauth2"
)

func (h *Handler) SyncContacts(ctx *fiber.Ctx, company models.Tenant) error {
	refreshToken := ""
	if company.RefreshToken != nil {
		refreshToken = *company.RefreshToken
	}

	fmt.Println("Refreshing access token for company:", company.ID)
	fmt.Println("Refresh token:", refreshToken)

	token := &oauth2.Token{
		RefreshToken: refreshToken,
	}
	tenantId := company.XeroTenantID

	fmt.Println("Tenant ID:", *tenantId)

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

	fmt.Println("Access token:", accessToken)

	url := "https://api.xero.com/api.xro/2.0/Contacts"

	if accessToken == "" || (tenantId != nil && *tenantId == "") || url == "" {
		fmt.Printf("Examine env values: accessToken=%s, tenantId=%s, url=%s\n", accessToken, func() string {
			if tenantId != nil {
				fmt.Println("Tenant ID is not nil")
				return *tenantId
			}
			return "nil"
		}(), url)
		return fmt.Errorf("missing required environment variables")
	}

	var contacts []interface{}
	remainingContacts := true
	client := &http.Client{}

	pageNum := 1
	pageSize := 100

	for remainingContacts {
		paginatedUrl := fmt.Sprintf("%s?page=%d&pageSize=%d", url, pageNum, pageSize)
		pageNum += 1

		req, err := http.NewRequest("GET", paginatedUrl, nil)
		if err != nil {
			return errs.BadRequest(fmt.Sprint("invalid request: ", err))
		}
		fmt.Println(paginatedUrl)

		req.Header.Set("Authorization", "Bearer "+accessToken)
		req.Header.Set("Accept", "application/json")
		req.Header.Set("Xero-tenant-id", *tenantId)
		fmt.Println(req.Header)
		fmt.Println(req.Body)

		// filter the contact results to only those after the last import time for this company
		if company.LastContactImportTime != nil {
			req.Header.Set("If-Modified-Since", company.LastContactImportTime.UTC().Format("2006-01-02T15:04:05"))
		}
		resp, err := client.Do(req)
		if err != nil {
			return errs.BadRequest(fmt.Sprint("error handling request: ", err))
		}
		defer resp.Body.Close()

		fmt.Println("Response status:", resp.StatusCode)

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			return errs.BadRequest(fmt.Sprint("unable to read response body: ", err))
		}

		fmt.Println("Response body:", string(body))

		if resp.StatusCode != http.StatusOK {
			return errs.BadRequest(fmt.Sprint("response status unsuccessful: ", err))
		}

		var response map[string]interface{}
		if err := json.Unmarshal(body, &response); err != nil {
			return errs.BadRequest(fmt.Sprint("unable to unpack response: ", err))
		}

		paginatedContacts, ok := response["Contacts"].([]interface{})
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
		remainingContacts = int(itemCount) == 100

		contacts = append(contacts, paginatedContacts...)
	}

	// parse the new line items from the fetched transactions
	newContacts, err := parseContacts(contacts, company)
	if err != nil {
		return err
	}

	// update company.last_imported_at to now so that we don't fetch the same transactions later
	_, err = h.companyRepository.UpdateCompanyLastContactImportTime(ctx.Context(), company.ID)
	if err != nil {
		return err
	}

	// send the new line items to the repository layer
	_, err = h.contactRepository.AddImportedContacts(ctx.Context(), newContacts)
	if err != nil {
		return err
	}

	return ctx.Status(fiber.StatusOK).JSON(contacts)
}

func parseContacts(contacts []interface{}, company models.Tenant) ([]models.AddImportedContactRequest, error) {
	var newContacts []models.AddImportedContactRequest

	for _, contact := range contacts {
		contactMap, ok := contact.(map[string]interface{})
		if !ok {
			return nil, errs.BadRequest("Invalid Contact format")
		}

		var xeroContactID string
		if contactMap["ContactID"] != nil {
			xeroContactID = contactMap["ContactID"].(string)
		} else {
			return nil, errs.BadRequest("Missing ContactID")
		}

		var name string
		if contactMap["Name"] != nil {
			name = contactMap["Name"].(string)
		} else {
			return nil, errs.BadRequest("Missing Name")
		}

		var email string
		if contactMap["EmailAddress"] != nil {
			email = contactMap["EmailAddress"].(string)
		}

		var phone string
		if contactMap["Phones"] != nil {
			phoneItems, ok := contactMap["Phones"].([]interface{})
			if !ok {
				return nil, errs.BadRequest("Invalid Phones format")
			}
			for _, phoneItem := range phoneItems {
				phoneMap, ok := phoneItem.(map[string]interface{})
				if !ok {
					return nil, errs.BadRequest("Invalid Phone format")
				}
				if phoneMap["PhoneType"] != "DEFAULT" {
					continue
				}

				if phoneMap["PhoneNumber"] != nil {
					phone = phoneMap["PhoneNumber"].(string)
				}
			}
		}

		var city string
		var state string
		if contactMap["Addresses"] != nil {
			addressItems, ok := contactMap["Addresses"].([]interface{})
			if !ok {
				return nil, errs.BadRequest("Invalid Addresses format")
			}
			for _, addressItem := range addressItems {
				addressMap, ok := addressItem.(map[string]interface{})
				if !ok {
					return nil, errs.BadRequest("Invalid Address format")
				}
				if addressMap["AddressType"] != "STREET" {
					continue
				}

				if addressMap["City"] != nil {
					city = addressMap["City"].(string)
				}

				if addressMap["Region"] != nil {
					state = addressMap["Region"].(string)
				}
			}
		}

		var newContact models.AddImportedContactRequest
		newContact.Name = name
		newContact.Email = email
		newContact.Phone = phone
		newContact.City = city
		newContact.State = state
		newContact.XeroContactID = &xeroContactID
		newContact.CompanyID = company.ID

		newContacts = append(newContacts, newContact)
	}
	fmt.Println("New contacts:", newContacts)

	return newContacts, nil
}
