package xero

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

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
	h.oAuthAuthorisationCode = ctx.Query("code")

	// Exchanges the authorization code for an access token with the Xero auth server.
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

	url := os.Getenv("CONNECTIONS_URL")

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
			tenantName, ok := connection["tenantName"].(string)
			if !ok {
				fmt.Println("Tenant Name not found or is not a string")
				continue
			}
			session.Set("tenantName", tenantName)
			session.Set("tenantID", tenantID)
		} else {
			fmt.Println("Tenant ID not found or is not a string")
		}
	}

	// Get the tenant ID from the session
	tenantID, ok := session.Get("tenantID").(string)
	if !ok {
		fmt.Println("Tenant ID not in session")
	}

	// Get company name from Xero
	companyName, ok := session.Get("tenantName").(string)
	if !ok {
		fmt.Println("Company name retrieval failed")
	}

	userID, ok := session.Get("userID").(string)
	if !ok {
		fmt.Println("User ID not in session")
	}

	// Set the company ID in the session
	companyID, err := h.getCompanyID(ctx, tenantID, companyName)
	if err != nil {
		fmt.Println("Company ID retrieval failed")
	}

	err = h.companyRepository.SetCredentials(ctx.Context(), userID, companyID, tok.AccessToken, tok.RefreshToken, tenantID)
	if err != nil {
		fmt.Println("Failed to set credentials")
	}

	session.Set("companyID", companyID)

	err = session.Save()
	if err != nil {
		fmt.Println("Error saving session:", err)
		return err
	}

	// Set the HTTP client for subsequent requests.
	h.oAuthHTTPClient = h.config.OAuth2Config.Client(ctx.Context(), tok)

	// Redirect to the home page.
	return ctx.Redirect("/health", fiber.StatusTemporaryRedirect)

}

func (h *Handler) getCompanyID(c *fiber.Ctx, xeroTenantID string, companyName string) (string, error) {
	companyID, err := h.companyRepository.GetOrCreateCompany(c.Context(), xeroTenantID, companyName)
	if err != nil {
		return "", err
	}

	return companyID, nil
}

func (h *Handler) getAuthorisationHeader() (string, string) {
	return "authorization", base64.StdEncoding.EncodeToString([]byte(
		fmt.Sprintf("Basic %s:%s", h.config.OAuth2Config.ClientID, h.config.OAuth2Config.ClientSecret),
	))
}
