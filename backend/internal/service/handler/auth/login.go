package auth

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gofiber/fiber/v2"
)

func (h *Handler) Login(c *fiber.Ctx) error {
	var creds Credentials
	if err := c.BodyParser(&creds); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	resp, err := h.makeSupabaseRequest("POST", "/token", map[string]string{"email": creds.Email, "password": creds.Password}) // Login uses /token endpoint
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": fmt.Sprintf("Login request failed: %v", err)})
	}
	defer resp.Body.Close()

	var authRes map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&authRes); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Error decoding Supabase response"})
	}

	if resp.StatusCode != http.StatusOK {
		return c.Status(resp.StatusCode).JSON(authRes) // Return Supabase error
	}

	return c.Status(fiber.StatusOK).JSON(authRes)
}

// 	var req struct {
// 		Email    string `json:"email"`
// 		Password string `json:"password"`
// 	}

// 	if err := c.BodyParser(&req); err != nil {
// 		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
// 	}

// 	resp, err := supabaseRequest("POST", "/auth/v1/token?grant_type=password", req)
// 	if err != nil {
// 		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to sign in"})
// 	}
// 	defer resp.Body.Close()

// 	body, _ := io.ReadAll(resp.Body)
// 	if resp.StatusCode != http.StatusOK {
// 		return c.Status(resp.StatusCode).Send(body)
// 	}

// 	return c.Send(body)
// }
