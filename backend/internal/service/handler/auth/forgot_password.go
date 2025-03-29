package auth

import (
	"arenius/internal/auth"
	"fmt"

	"github.com/gofiber/fiber/v2"
)

func (h *Handler) ForgotPassword(c *fiber.Ctx) error {
	var creds struct {
		Email string `json:"email"`
	}

	// Parse request body
	if err := c.BodyParser(&creds); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// Call Supabase to send reset email
	err := auth.SupabaseForgotPassword(&h.config, creds.Email)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": fmt.Sprintf("Password reset request failed: %v", err)})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Password reset email sent"})
}
