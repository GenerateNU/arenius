package auth

import (
	"arenius/internal/auth"
	"fmt"
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

	fmt.Println("userID", signInResponse.User.ID.String())

	// Set cookies
	c.Cookie(&fiber.Cookie{
		Name:     "userID",
		Value:    signInResponse.User.ID.String(),
		Expires:  time.Now().Add(24 * time.Hour),
		HTTPOnly: true,
		Secure:   true,
		SameSite: "Lax",
	})

	c.Cookie(&fiber.Cookie{
		Name:     "jwt",
		Value:    signInResponse.AccessToken,
		Expires:  time.Now().Add(24 * time.Hour),
		HTTPOnly: true,
		Secure:   true,
		SameSite: "Lax",
	})

	// Retrieve and store additional credentials if needed
	if c.Cookies("tenantID") == "" || c.Cookies("accessToken") == "" || c.Cookies("refreshToken") == "" || c.Cookies("expiry") == "" {
		xeroCreds, err := h.userRepository.GetCredentialsByUserID(c.Context(), signInResponse.User.ID.String())
		if err != nil {
			fmt.Println("Failed to get credentials")
		}
		c.Cookie(&fiber.Cookie{
			Name:     "refreshToken",
			Value:    xeroCreds.RefreshToken.String(),
			Expires:  time.Now().Add(7 * 24 * time.Hour),
			HTTPOnly: true,
			Secure:   true,
			SameSite: "Lax",
		})
		c.Cookie(&fiber.Cookie{
			Name:     "tenantID",
			Value:    xeroCreds.TenantID.String(),
			Expires:  time.Now().Add(24 * time.Hour),
			HTTPOnly: true,
			Secure:   true,
			SameSite: "Lax",
		})
		c.Cookie(&fiber.Cookie{
			Name:     "companyID",
			Value:    xeroCreds.CompanyID.String(),
			Expires:  time.Now().Add(24 * time.Hour),
			HTTPOnly: true,
			Secure:   true,
			SameSite: "Lax",
		})
	}

	return c.Status(fiber.StatusOK).JSON(signInResponse)
}
