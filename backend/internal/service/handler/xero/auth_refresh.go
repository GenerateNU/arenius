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

	userId, companyId, tenantId, err := h.UserRepository.GetUserbyRefreshToken(ctx.Context(), h.oAuthToken.RefreshToken)
	if err != nil {
		return ctx.Status(fiber.StatusUnauthorized).SendString("No user found for the given refresh token")
	}

	tokenSource := h.config.OAuth2Config.TokenSource(ctx.Context(), h.oAuthToken)
	newToken, err := tokenSource.Token()
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).SendString("Failed to refresh access token")
	}

	// Update the handler's token
	h.oAuthToken = newToken

	h.UserRepository.SetUserCredentials(ctx.Context(), userId, companyId, newToken.RefreshToken, tenantId)

	// Update Cookies
	ctx.Cookie(&fiber.Cookie{
		Name:     "accessToken",
		Value:    newToken.AccessToken,
		Expires:  time.Now().Add(time.Hour * 1),
		HTTPOnly: true,
		Secure:   true,
		SameSite: "Lax",
	})

	//Access token expiration time
	ctx.Cookie(&fiber.Cookie{
		Name:     "expiry",
		Value:    newToken.Expiry.Format(time.RFC3339),
		Expires:  time.Now().Add(time.Hour * 1),
		HTTPOnly: true,
		Secure:   true,
		SameSite: "Lax",
	})

	ctx.Cookie(&fiber.Cookie{
		Name:     "refreshToken",
		Value:    newToken.RefreshToken,
		Expires:  time.Now().Add(time.Hour * 24 * 30),
		HTTPOnly: true,
		Secure:   true,
		SameSite: "Lax",
	})

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
