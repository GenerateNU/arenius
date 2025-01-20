package xero

import (
	"fmt"
	"net/http"

	"github.com/gofiber/fiber/v2/middleware/session"
	"github.com/joho/godotenv"
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
	err := godotenv.Load()
	if err != nil {
		fmt.Println("Error loading .env file")
	}

	oAuthScopes := []string{
		"openid",
		"profile",
		"email",
		"accounting.transactions",
		"accounting.settings",
		"offline_access",
	}

	oauthConfig := &oauth2.Config{
		ClientID:     "ID",
		ClientSecret: "SECRET",
		RedirectURL:  "http://localhost:8080/callback",
		Scopes:       oAuthScopes,
		Endpoint: oauth2.Endpoint{
			AuthURL:  "https://login.xero.com/identity/connect/authorize",
			TokenURL: "https://identity.xero.com/connect/token",
		},
	}

	return &Handler{sess, &Config{oauthConfig}, "", nil, nil}
}
