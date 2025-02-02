package auth

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gofiber/fiber/v2"
)

func (h *Handler) SignUp(c *fiber.Ctx) error {
	var creds Credentials
	fmt.Println(creds)
	if err := c.BodyParser(&creds); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	fmt.Println(creds)
	resp, err := h.makeSupabaseRequest("POST", "/signup", creds)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": fmt.Sprintf("Signup request failed: %v", err)})
	}
	defer resp.Body.Close()

	var authRes map[string]interface{} // Use a generic map to handle the Supabase response
	if err := json.NewDecoder(resp.Body).Decode(&authRes); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Error decoding Supabase response"})
	}

	if resp.StatusCode != http.StatusCreated {
		return c.Status(resp.StatusCode).JSON(authRes) // Return Supabase error if signup fails
	}

	return c.Status(fiber.StatusCreated).JSON(authRes)
}

// 	var req struct {
// 		Email    string `json:"email"`
// 		Password string `json:"password"`
// 	}

// 	if err := c.BodyParser(&req); err != nil {
// 		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
// 	}

// 	resp, err := supabaseRequest("POST", "/auth/v1/signup", req)
// 	if err != nil {
// 		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to sign up"})
// 	}
// 	defer resp.Body.Close()

// 	body, _ := io.ReadAll(resp.Body)
// 	if resp.StatusCode != http.StatusOK {
// 		return c.Status(resp.StatusCode).Send(body)
// 	}

// 	return c.Send(body)
// }
