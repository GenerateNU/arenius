package auth

import (
	"arenius/internal/auth"
	"fmt"

	"github.com/gofiber/fiber/v2"
)

func (h *Handler) ResetPassword(c *fiber.Ctx) error {
	var payload struct {
		Password string `json:"password"`
	}

	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if payload.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "New password is required"})
	}

	// The token is typically passed as a query parameter from the reset link
	token := c.Query("token")
	if token == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Reset token is missing"})
	}

	err := auth.SupabaseUpdatePassword(&h.config, token, payload.Password)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": fmt.Sprintf("Password update failed: %v", err)})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Password has been reset successfully"})
}
