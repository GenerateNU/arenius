package xero

import (
	"net/http"
	"os"

	"github.com/gofiber/fiber/v2/middleware/session"
	"golang.org/x/oauth2"
)

type Config struct {
	OAuth2Config *oauth2.Config
}

type Handler struct {
	sess                   *session.Store
	config                 *Config
	oAuthAuthorisationCode string
	oAuthToken             *oauth2.Token
	oAuthHTTPClient        *http.Client
}

func NewHandler(sess *session.Store) *Handler {
	client_id := os.Getenv("CLIENT_ID")
	client_secret := os.Getenv("CLIENT_SECRET")
	redirect_url := os.Getenv("REDIRECT_URL")
	auth_url := os.Getenv("AUTH_URL")
	token_url := os.Getenv("TOKEN_URL")

	oAuthScopes := []string{
		"openid",
		"profile",
		"email",
		"accounting.transactions",
		"accounting.settings",
		"offline_access",
	}

	oauthConfig := &oauth2.Config{
		ClientID:     client_id,
		ClientSecret: client_secret,
		RedirectURL:  redirect_url,
		Scopes:       oAuthScopes,
		Endpoint: oauth2.Endpoint{
			AuthURL:  auth_url,
			TokenURL: token_url,
		},
	}

	return &Handler{sess, &Config{oauthConfig}, "", nil, nil}
}
