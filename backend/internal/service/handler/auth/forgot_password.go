package auth

import (
	"arenius/internal/auth"
	"fmt"

	"github.com/gofiber/fiber/v2"
)

func (h *Handler) ForgotPassword(c *fiber.Ctx) error {
	var payload struct {
		Email string `json:"email"`
	}

	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if payload.Email == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Email is required"})
	}

	err := auth.SupabaseResetPassword(&h.config, payload.Email)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": fmt.Sprintf("Password reset request failed: %v", err)})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Password reset email sent"})
}
