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
	var cookieExp time.Time

	if err := c.BodyParser(&creds); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// Call SupabaseLogin function
	signInResponse, err := auth.SupabaseLogin(&h.config, creds.Email, creds.Password)
	if err != nil {
		fmt.Println("Supabase login error:", err)
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": err.Error()})
	}

	fmt.Println(creds.RememberMe)

	if creds.RememberMe {
		cookieExp = time.Now().Add(7 * 24 * time.Hour)
	} else {
		cookieExp = time.Time{}
	}

	// Set cookies
	c.Cookie(&fiber.Cookie{
		Name:     "userID",
		Value:    signInResponse.User.ID.String(),
		Expires:  cookieExp,
		Secure:   true,
		SameSite: "Lax",
	})

	c.Cookie(&fiber.Cookie{
		Name:     "jwt",
		Value:    signInResponse.AccessToken,
		Expires:  cookieExp,
		Secure:   true,
		SameSite: "Lax",
	})

	tenantID := ""

	// Retrieve and store additional credentials if needed
	if c.Cookies("tenantID") == "" || c.Cookies("accessToken") == "" || c.Cookies("refreshToken") == "" || c.Cookies("expiry") == "" {
		xeroCreds, err := h.userRepository.GetCredentialsByUserID(c.Context(), signInResponse.User.ID.String())
		if err != nil {
			fmt.Println("Error getting credentials:", err)
		}
		c.Cookie(&fiber.Cookie{
			Name:     "refreshToken",
			Value:    xeroCreds.RefreshToken,
			Expires:  cookieExp,
			Secure:   true,
			SameSite: "Lax",
		})
		c.Cookie(&fiber.Cookie{
			Name:     "tenantID",
			Value:    xeroCreds.TenantID.String(),
			Expires:  cookieExp,
			Secure:   true,
			SameSite: "Lax",
		})
		c.Cookie(&fiber.Cookie{
			Name:     "companyID",
			Value:    xeroCreds.CompanyID.String(),
			Expires:  cookieExp,
			Secure:   true,
			SameSite: "Lax",
		})

		tenantID = xeroCreds.TenantID.String()
	}

	// Get tenant ID from cookies
	tID := tenantID
	jwtToken := signInResponse.AccessToken

	go func() {
		// Create an HTTP request with tenant ID as a query parameter
		syncURL := fmt.Sprintf("http://localhost:8080/sync-transactions?tenantId=%s", url.QueryEscape(tID))

		req, err := http.NewRequest("POST", syncURL, nil)
		if err != nil {
			fmt.Printf("Error creating sync request: %v\n", err)
			return
		}

		// Manually attach the jwt token as a Cookie
		req.Header.Set("Cookie", fmt.Sprintf("jwt=%s", jwtToken)) // Pass the jwt cookie

		// Make the HTTP request to sync transactions
		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			fmt.Printf("Error making sync request: %v\n", err)
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			fmt.Printf("Error syncing transactions, status code: %d\n", resp.StatusCode)
			return
		}

		fmt.Println("Background transaction sync completed successfully")
	}()

	return c.Status(fiber.StatusOK).JSON(signInResponse)
}
