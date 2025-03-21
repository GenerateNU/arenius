package user

import (
	"github.com/gofiber/fiber/v2"
)

func (h *Handler) GetUserProfile(c *fiber.Ctx) error {
	userId := c.Params("id")

	user, err := h.UserRepository.GetUserProfile(c.Context(), userId)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(user)
}
