package xero

import (
	"arenius/internal/errs"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

func GetBankTransactions() ([]map[string]interface{}, error) {
	accessToken := os.Getenv("ACCESS_TOKEN")
	tenantId := os.Getenv("TENANT_ID")
	url := os.Getenv("TRANSACTIONS_URL")

	if accessToken == "" || tenantId == "" || url == "" {
		fmt.Printf("Examine env values: accessToken=%s, tenantId=%s, url=%s\n", accessToken, tenantId, url)
		return nil, fmt.Errorf("missing required environment variables")
	}

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, errs.BadRequest(fmt.Sprint("invalid request: ", err))
	}

	req.Header.Set("Authorization", "Bearer "+accessToken)
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Xero-tenant-id", tenantId)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, errs.BadRequest(fmt.Sprint("error handling request: ", err))
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, errs.BadRequest(fmt.Sprint("response status unsuccessful: ", err))
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, errs.BadRequest(fmt.Sprint("unable to read response body: ", err))
	}

	var response map[string]interface{}
	if err := json.Unmarshal(body, &response); err != nil {
		return nil, errs.BadRequest(fmt.Sprint("unable to unpack reponse: ", err))
	}

	transactions, ok := response["BankTransactions"].([]interface{})
	if !ok {
		return nil, errs.BadRequest(fmt.Sprint("unable to store response: ", err))
	}

	var result []map[string]interface{}
	for _, transaction := range transactions {
		if t, ok := transaction.(map[string]interface{}); ok {
			result = append(result, t)
		}
	}

	return result, nil
}
