package auth

import (
	"arenius/internal/auth"
	"fmt"
	"net/http"
	"net/url"
	"time"

	"github.com/gofiber/fiber/v2"
)

func (h *Handler) Login(c *fiber.Ctx) error {
	var creds Credentials

	if err := c.BodyParser(&creds); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// Call SupabaseLogin function
	signInResponse, err := auth.SupabaseLogin(&h.config, creds.Email, creds.Password)
	if err != nil {
		fmt.Println("Supabase login error:", err)
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": err.Error()})
	}

	// Set cookies
	c.Cookie(&fiber.Cookie{
		Name:     "userID",
		Value:    signInResponse.User.ID.String(),
		Expires:  time.Now().Add(24 * time.Hour),
		Secure:   true,
		SameSite: "Lax",
	})

	c.Cookie(&fiber.Cookie{
		Name:     "jwt",
		Value:    signInResponse.AccessToken,
		Expires:  time.Now().Add(24 * time.Hour),
		Secure:   true,
		SameSite: "Lax",
	})

	// Retrieve and store additional credentials if needed
	if c.Cookies("tenantID") == "" || c.Cookies("accessToken") == "" || c.Cookies("refreshToken") == "" || c.Cookies("expiry") == "" {
		xeroCreds, err := h.userRepository.GetCredentialsByUserID(c.Context(), signInResponse.User.ID.String())
		if err != nil {
			fmt.Println("Error getting credentials:", err)
			fmt.Println("Failed to get credentials")
		}
		c.Cookie(&fiber.Cookie{
			Name:     "refreshToken",
			Value:    xeroCreds.RefreshToken,
			Expires:  time.Now().Add(7 * 24 * time.Hour),
			Secure:   true,
			SameSite: "Lax",
		})
		c.Cookie(&fiber.Cookie{
			Name:     "tenantID",
			Value:    xeroCreds.TenantID.String(),
			Expires:  time.Now().Add(24 * time.Hour),
			Secure:   true,
			SameSite: "Lax",
		})
		c.Cookie(&fiber.Cookie{
			Name:     "companyID",
			Value:    xeroCreds.CompanyID.String(),
			Expires:  time.Now().Add(24 * time.Hour),
			Secure:   true,
			SameSite: "Lax",
		})
	}

	// Get tenant ID from cookies
	tenantID := c.Cookies("tenantID")

	// Create an HTTP request with tenant ID as a query parameter
	syncURL := fmt.Sprintf("http://localhost:8080/sync-transactions?tenantId=%s", url.QueryEscape(tenantID))

	req, err := http.NewRequest("POST", syncURL, nil)
	if err != nil {
		return fmt.Errorf("error creating request: %w", err)
	}

	// Manually attach the jwt token as a Cookie
	jwtToken := signInResponse.AccessToken
	req.Header.Set("Cookie", fmt.Sprintf("jwt=%s", jwtToken)) // Pass the jwt cookie

	// Make the HTTP request to sync transactions
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("error making request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("error syncing transactions, status code: %d", resp.StatusCode)
	}

	return c.Status(fiber.StatusOK).JSON(signInResponse)
}
