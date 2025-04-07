package auth

import (
	"arenius/internal/auth"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
)

func (h *Handler) SignOut(c *fiber.Ctx) error {
	accessToken := c.Cookies("jwt")
	if accessToken == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "No authentication token found"})
	}
	fmt.Println("Access Token:", accessToken)

	// Call SupabaseRevokeSession to invalidate the session
	_ = auth.SupabaseRevokeSession(&h.config, accessToken)

	clearCookie := func(name string) {
		c.Cookie(&fiber.Cookie{
			Name:     name,
			Value:    "",
			Path:     "/",
			Expires:  time.Unix(0, 0),
			MaxAge:   -1,
			Secure:   true,
			SameSite: "Lax",
		})
	}

	clearCookie("jwt")
	clearCookie("userID")
	clearCookie("refreshToken")
	clearCookie("tenantID")
	clearCookie("companyID")

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Successfully signed out",
	})
}
