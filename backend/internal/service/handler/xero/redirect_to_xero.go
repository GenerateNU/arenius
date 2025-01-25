package xero

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/oauth2"
)

func (h *Handler) RedirectToAuthorisationEndpoint(ctx *fiber.Ctx) error {
	// Generate the Xero authorization URL.
	authURL := h.config.OAuth2Config.AuthCodeURL("state", oauth2.AccessTypeOffline)

	// Redirect to the generated URL.
	return ctx.Redirect(authURL, fiber.StatusTemporaryRedirect)
}

func (h *Handler) Callback(ctx *fiber.Ctx) error {
	var tenantIDToken string
	h.oAuthAuthorisationCode = ctx.Query("code")

	// Exchanges the authorization code for an access token
	// with the Xero auth server.
	tok, err := h.config.OAuth2Config.Exchange(
		ctx.Context(),
		h.oAuthAuthorisationCode,
		oauth2.SetAuthURLParam(h.getAuthorisationHeader()),
	)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).SendString("An error occurred while trying to exchange the authorization code with the Xero API.")
	}

	// Update the server struct with the token.
	h.oAuthToken = tok
	session, err := h.sess.Get(ctx)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).SendString("Failed to create session")
	}
	session.Set("accessToken", tok.AccessToken)
	session.Set("refreshToken", tok.RefreshToken)

	url := "https://api.xero.com/connections"

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		log.Fatalf("Error creating request: %v", err)
	}

	req.Header.Set("Authorization", "Bearer "+tok.AccessToken)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Fatalf("Error sending request: %v", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Fatalf("Error reading response body: %v", err)
	}

	if resp.StatusCode == http.StatusOK {
		fmt.Println("Successfully fetched connections!")
	} else {
		fmt.Println("Error fetching connections!")
	}

	var connections []map[string]interface{}
	err = json.Unmarshal(body, &connections)
	if err != nil {
		log.Fatalf("Error parsing JSON: %v", err)
	}

	for _, connection := range connections {
		if tenantID, ok := connection["tenantId"].(string); ok {
			session.Set("tenantID", tenantID)
			tenantIDToken = tenantID
		} else {
			fmt.Println("Tenant ID not found or is not a string")
		}
	}

	err = session.Save()
	if err != nil {
		fmt.Println("Error saving session:", err)
		return err
	}

	// Set the HTTP client for subsequent requests.
	h.oAuthHTTPClient = h.config.OAuth2Config.Client(ctx.Context(), tok)

	handler := &Handler{}
	err = handler.getBankTransactions(tok.AccessToken, tenantIDToken)

	if err != nil {
		fmt.Println("Error:", err)
		return err
	}

	// Redirect to the home page.
	return ctx.Redirect("/health", fiber.StatusTemporaryRedirect)

}

func (h *Handler) getAuthorisationHeader() (string, string) {
	return "authorization", base64.StdEncoding.EncodeToString([]byte(
		fmt.Sprintf("Basic %s:%s", h.config.OAuth2Config.ClientID, h.config.OAuth2Config.ClientSecret),
	))
}

func (h *Handler) getBankTransactions(accessToken, tenantId string) error {
	url := "https://api.xero.com/api.xro/2.0/BankTransactions"

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return fmt.Errorf("error creating request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+accessToken)
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Xero-tenant-id", tenantId)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("error making request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("unexpected response status: %s", resp.Status)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("error reading response body: %w", err)
	}

	fmt.Println("Response Status:", resp.Status)
	fmt.Println("Response Body:", string(body))

	return nil
}
