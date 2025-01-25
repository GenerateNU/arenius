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

	var result []map[string]interface{}
	for _, transaction := range transactions {
		if t, ok := transaction.(map[string]interface{}); ok {
			result = append(result, t)
		}
	}

	return ctx.Status(fiber.StatusOK).JSON(transactions)
}
