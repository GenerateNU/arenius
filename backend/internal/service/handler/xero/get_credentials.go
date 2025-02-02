package xero

import (
	"arenius/internal/storage"

	"github.com/gofiber/fiber/v2"
)

func (h *Handler) GetCredentials(c *fiber.Ctx, credsRepo storage.CredentialsRepository) error {

	lineItems, err := credsRepo.GetCredentials(c.Context())
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(lineItems)
}
