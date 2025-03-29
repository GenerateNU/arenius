package auth

import (
	"arenius/internal/auth"
	"fmt"

	"github.com/gofiber/fiber/v2"
)

func (h *Handler) ResetPassword(c *fiber.Ctx) error {
	// Parse the request body to get the reset token and the new password
	var request struct {
		Token    string `json:"token"`
		Password string `json:"password"`
	}

	if err := c.BodyParser(&request); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// Call Supabase API to reset the password
	err := auth.SupabaseResetPassword(&h.config, request.Token, request.Password)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": fmt.Sprintf("Password reset failed: %v", err)})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Password reset successfully"})
}
