package xero

import (
	"arenius/internal/errs"
	"arenius/internal/models"
	"arenius/internal/storage"
	"fmt"

	"github.com/gofiber/fiber/v2"
)

func (h *Handler) CreateCredentials(c *fiber.Ctx, credsRepo storage.CredentialsRepository) error {

	var xero_creds models.XeroCredentials

	if err := c.BodyParser(&xero_creds); err != nil {
		return errs.BadRequest(fmt.Sprintf("error parsing request body: %v", err))
	}

	creds, err := credsRepo.CreateCredentials(c.Context(), xero_creds)

	if err != nil {
		return err
	}
	fmt.Println("Created credentials:", creds)
	return err
}
