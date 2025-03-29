package auth

import (
	"arenius/internal/auth"
	"fmt"

	"github.com/gofiber/fiber/v2"
)

// DeleteAccount handler to revoke session, delete the account and clear cookies
func (h *Handler) DeleteAccount(c *fiber.Ctx, id string) error {
	// Retrieve the JWT token from cookies
	accessToken := c.Cookies("jwt")
	if accessToken == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "No authentication token found"})
	}

	_, err := h.userRepository.DeleteUser(c.Context(), id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": fmt.Sprintf("Adding User request failed: %v", err)})
	}

	// Call SupabaseDeleteAccount to delete the account
	err = auth.SupabaseDeleteAccount(&h.config, accessToken)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": fmt.Sprintf("Failed to delete account: %v", err)})
	}

	// Clear cookies related to authentication
	c.ClearCookie("jwt")
	c.ClearCookie("userID")
	c.ClearCookie("refreshToken")
	c.ClearCookie("tenantID")
	c.ClearCookie("companyID")

	// Return success response
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Account successfully deleted",
	})
}
