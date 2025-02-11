package xero

// import (
// 	"arenius/internal/models"
// 	"arenius/internal/storage"
// 	"fmt"
// 	"log"

// 	"github.com/gofiber/fiber/v2"
// )

// func (h *Handler) GetCredentials(c *fiber.Ctx, credsRepo storage.CredentialsRepository) error {
// 	fmt.Println("GetCredentials")

// 	credentials, err := credsRepo.GetCredentials(c.Context())
// 	if err != nil {
// 		return nil
// 	}

// 	// Ensure no nil values are returned
// 	response := models.XeroCredentials{
// 		CompanyID:    credentials.CompanyID,
// 		AccessToken:  credentials.AccessToken,
// 		RefreshToken: credentials.RefreshToken,
// 		TenantID:     credentials.TenantID,
// 	}

// 	fmt.Println("Returning credentials:", response)
// 	log.Printf("Returning credentials: %+v\n", response)
// 	return c.Status(fiber.StatusOK).JSON(response)

// }
