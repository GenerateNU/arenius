package auth

import (
	"arenius/internal/auth"
	"fmt"

	"github.com/gofiber/fiber/v2"
)

func (h *Handler) SignOut(c *fiber.Ctx) error {
	accessToken := c.Cookies("jwt")
	if accessToken == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "No authentication token found"})
	}

	// Call SupabaseRevokeSession to invalidate the session
	err := auth.SupabaseRevokeSession(&h.config, accessToken)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": fmt.Sprintf("Failed to revoke session: %v", err)})
	}

	c.ClearCookie("jwt")
	c.ClearCookie("userID")
	c.ClearCookie("refreshToken")
	c.ClearCookie("tenantID")
	c.ClearCookie("companyID")

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Successfully signed out",
	})
}
