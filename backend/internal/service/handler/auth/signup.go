package auth

import (
	"arenius/internal/auth"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
)

func (h *Handler) SignUp(c *fiber.Ctx) error {
	fmt.Println("HERE")

	var creds Credentials
	if err := c.BodyParser(&creds); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	response, err := auth.SupabaseSignup(&h.config, creds.Email, creds.Password)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": fmt.Sprintf("Signup request failed: %v", err)})
	}

	_, err = h.userRepository.AddUser(c.Context(), response.User.ID.String(), creds.FirstName, creds.LastName)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": fmt.Sprintf("Adding User request failed: %v", err)})
	}

	// Set cookies with the JWT token
	expiration := time.Now().Add(24 * time.Hour) // Set cookie expiration time
	c.Cookie(&fiber.Cookie{
		Name:     "jwt",
		Value:    response.AccessToken,
		Expires:  expiration,
		HTTPOnly: true,
		Secure:   true,
		SameSite: "Lax",
	})

	c.Cookie(&fiber.Cookie{
		Name:     "userID",
		Value:    response.User.ID.String(),
		Expires:  expiration,
		HTTPOnly: true,
		Secure:   true,
		SameSite: "Lax",
	})

	return c.Status(fiber.StatusCreated).JSON(response)
}
