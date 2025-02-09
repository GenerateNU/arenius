package xero

import (
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/oauth2"
)

func (h *Handler) XeroAuthMiddleware(ctx *fiber.Ctx) error {
	session, err := h.sess.Get(ctx)
	fmt.Println("middleware")
	if err != nil {
		return ctx.Status(fiber.StatusUnauthorized).SendString("Session error")
	}

	accessToken := session.Get("accessToken").(string)
	if accessToken == "" {
		return ctx.Status(fiber.StatusUnauthorized).SendString("No access token")
	}

	h.oAuthToken = &oauth2.Token{
		AccessToken:  accessToken,
		RefreshToken: session.Get("refreshToken").(string),
		Expiry:       time.Now().Add(-1 * time.Minute), // Force refresh if unknown
	}

	if h.oAuthToken.Expiry.Before(time.Now()) {
		err := h.RefreshAccessToken(ctx)
		if err != nil {
			return ctx.Status(fiber.StatusUnauthorized).SendString("Failed to refresh token")
		}
	}

	fmt.Println("Access token:", h.oAuthToken.AccessToken)
	return ctx.Next() // Continue to next handler
}
