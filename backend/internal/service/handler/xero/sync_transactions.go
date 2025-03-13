package xero

import (
	"arenius/internal/models"
	"fmt"
	"log"

	"github.com/gofiber/fiber/v2"
)

func (h *Handler) SyncTransactions(ctx *fiber.Ctx) error {
	tenantId := ctx.Query("tenantId")
	fmt.Println("Syncing transactions for tenantId:", tenantId)

	var companies []models.Tenant
	var err error

	if tenantId != "" {
		// Sync transactions for a specific company
		company, err := h.companyRepository.GetTenantByTenantID(ctx.Context(), tenantId)
		if err != nil {
			return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Company not found for the given tenantId",
			})
		}
		companies = []models.Tenant{*company} // Convert single company to slice
	} else {
		// Sync transactions for all companies
		fmt.Println("Syncing transactions for all companies")
		companies, err = h.companyRepository.GetAllTenants(ctx.Context())
		if err != nil {
			fmt.Println("Error retrieving companies:", err)
			return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to retrieve companies",
			})
		}
	}

	// Loop through the companies and sync transactions
	for _, company := range companies {
		fmt.Println("Syncing transactions for company:", company.ID)
		err := h.syncCompanyTransactions(ctx, company)
		log.Println("err", err)
		if err != nil {
			log.Printf("Error syncing transactions for company %s: %v\n", company.ID, err)
		} else {
			log.Printf("Successfully synced transactions for company %s\n", company.ID)
		}
		fmt.Println(1)
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Transactions sync completed",
	})
}
