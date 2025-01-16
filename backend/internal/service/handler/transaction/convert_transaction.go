package transaction

import (
	"arenius/internal/errs"
	"arenius/internal/models"
	"fmt"

	"github.com/gofiber/fiber/v2"
)

func (h *Handler) ConvertTransactions(c *fiber.Ctx) error {
	var req models.Transaction
	if err := c.BodyParser(&req); err != nil {
		return errs.BadRequest(fmt.Sprint("invalid request body: ", err))
	}

	transaction, err := h.transactionRepository.ConvertTransactions(c.Context(), []models.Transaction{req})
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusCreated).JSON(transaction)
}
