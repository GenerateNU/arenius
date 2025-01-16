package xero

import (
	"encoding/base64"
	"fmt"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/oauth2"
)

func (h *Handler) RedirectToAuthorisationEndpoint(ctx *fiber.Ctx) error {
	// Generate the Xero authorization URL.
	authURL := h.config.OAuth2Config.AuthCodeURL("state", oauth2.AccessTypeOffline)

	// Redirect to the generated URL.
	return ctx.Redirect(authURL, fiber.StatusTemporaryRedirect)
}

func (h *Handler) Callback(ctx *fiber.Ctx) error {

	h.oAuthAuthorisationCode = ctx.Query("code")

	// Exchanges the authorization code for an access token
	// with the Xero auth server.
	tok, err := h.config.OAuth2Config.Exchange(
		ctx.Context(),
		h.oAuthAuthorisationCode,
		oauth2.SetAuthURLParam(h.getAuthorisationHeader()),
	)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).SendString("An error occurred while trying to exchange the authorization code with the Xero API.")
	}

	// Update the server struct with the token.
	h.oAuthToken = tok
	session, err := h.sess.Get(ctx)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).SendString("Failed to create session")
	}
	session.Set("accessToken", tok.AccessToken)
	session.Set("refreshToken", tok.RefreshToken)
	session.Save()
	print("ACCESS TOKEN:", tok.AccessToken)

	// Set the HTTP client for subsequent requests.
	h.oAuthHTTPClient = h.config.OAuth2Config.Client(ctx.Context(), tok)

	// Redirect to the home page.
	return ctx.Redirect("/health", fiber.StatusTemporaryRedirect)
}

func (h *Handler) getAuthorisationHeader() (string, string) {
	return "authorization", base64.StdEncoding.EncodeToString([]byte(
		fmt.Sprintf("Basic %s:%s", h.config.OAuth2Config.ClientID, h.config.OAuth2Config.ClientSecret),
	))
}
