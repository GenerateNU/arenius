package xero

import (
	"net/http"
	"time"

	"github.com/gofiber/fiber/v2"
)

func (h *Handler) RefreshAccessToken(ctx *fiber.Ctx) error {
	if h.oAuthToken == nil || h.oAuthToken.RefreshToken == "" {
		return ctx.Status(fiber.StatusUnauthorized).SendString("No refresh token available")
	}

	tokenSource := h.config.OAuth2Config.TokenSource(ctx.Context(), h.oAuthToken)
	newToken, err := tokenSource.Token()
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).SendString("Failed to refresh access token")
	}

	// Update the handler's token
	h.oAuthToken = newToken

	// Update session storage
	session, err := h.sess.Get(ctx)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).SendString("Failed to get session")
	}
	session.Set("accessToken", newToken.AccessToken)
	session.Set("refreshToken", newToken.RefreshToken)
	err = session.Save()
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).SendString("Failed to save session")
	}

	return nil
}

func (h *Handler) MakeAuthenticatedRequest(ctx *fiber.Ctx, url string) (*http.Response, error) {
	if h.oAuthToken == nil || h.oAuthToken.Expiry.Before(time.Now()) {
		err := h.RefreshAccessToken(ctx)
		if err != nil {
			return nil, err
		}
	}

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", "Bearer "+h.oAuthToken.AccessToken)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	return client.Do(req)
}
