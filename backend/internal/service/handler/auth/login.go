package auth

import (
	"arenius/internal/auth"

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
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": err.Error()})
	}

	// Store JWT in session
	sess, err := h.sess.Get(c)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get session"})
	}
	sess.Set("jwt", signInResponse.AccessToken)
	if err := sess.Save(); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to save session"})
	}

	return c.Status(fiber.StatusOK).JSON(signInResponse)
}
