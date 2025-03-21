package user

import (
	"arenius/internal/errs"
	"arenius/internal/models"
	"fmt"

	"github.com/gofiber/fiber/v2"
)

func (h *Handler) UpdateUserProfile(c *fiber.Ctx) error {

	var req models.User
	if err := c.BodyParser(&req); err != nil {
		return errs.BadRequest("Invalid request payload: " + err.Error())
	}

	user, err := h.UserRepository.UpdateUserProfile(c.Context(), req)

	if err != nil {
		fmt.Println("Error updating user", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update user."})
	}

	return c.Status(fiber.StatusOK).JSON(user)
}
