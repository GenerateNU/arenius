package xero

import (
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/oauth2"
)

func (h *Handler) XeroAuthMiddleware(ctx *fiber.Ctx) error {
	accessToken := ctx.Cookies("accessToken", "")
	fmt.Println(("HERER"))
	// if accessToken == "" {
	// 	return ctx.Status(fiber.StatusUnauthorized).SendString("No access token")
	// }

	expiryStr := ctx.Cookies("expiry", "")
	var expiry time.Time
	var err error

	// Handle missing or invalid expiry cookie
	if expiryStr != "" {
		expiry, err = time.Parse(time.RFC3339, expiryStr)
		if err != nil {
			// Invalid expiry format, assuming expired token.
			expiry = time.Now().Add(-time.Minute) // Force refresh if parsing fails
		}
	} else {
		expiry = time.Now().Add(-time.Minute) // Force refresh if expiry is missing
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
	fmt.Println(("HERER2"))
	return ctx.Next() // Continue to next handler
}
