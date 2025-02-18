package xero

import (
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/oauth2"
)

func (h *Handler) XeroAuthMiddleware(ctx *fiber.Ctx) error {
	fmt.Println("middleware")

	accessToken := ctx.Cookies("accessToken", "")
	// if accessToken == "" {
	// 	return ctx.Status(fiber.StatusUnauthorized).SendString("No access token")
	// }

	expiryStr := ctx.Cookies("expiry", "")
	expiry, err := time.Parse(time.RFC3339, expiryStr)
	if err != nil {
		fmt.Println("Error parsing expiry time:", err)
		return ctx.Status(fiber.StatusUnauthorized).SendString("Invalid expiry format")
	}

	h.oAuthToken = &oauth2.Token{
		AccessToken:  accessToken,
		RefreshToken: ctx.Cookies("refreshToken", ""),
		Expiry:       expiry,
	}

	if h.oAuthToken.Expiry.Before(time.Now()) || h.oAuthToken.AccessToken == "" {
		err := h.RefreshAccessToken(ctx)
		if err != nil {
			return ctx.Status(fiber.StatusUnauthorized).SendString("Failed to refresh token")
		}
	}

	fmt.Println("Access token:", ctx.Cookies("accessToken", ""))
	return ctx.Next() // Continue to next handler
}
