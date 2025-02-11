package xero

import (
	"arenius/internal/errs"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/gofiber/fiber/v2"
)

func (h *Handler) GetOrganizationName(ctx *fiber.Ctx) error {
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
