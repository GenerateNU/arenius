package xero

import (
	"fmt"
	"net/http"

	"github.com/joho/godotenv"
	"golang.org/x/oauth2"
)

type Config struct {
	OAuth2Config *oauth2.Config
}

type Handler struct {
	config                 *Config
	oAuthAuthorisationCode string
	oAuthToken             *oauth2.Token
	oAuthHTTPClient        *http.Client
}

func NewHandler() *Handler {
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
		ClientID:     "E1B6C918F29E4C48A2097A725A76C505",
		ClientSecret: "wsKPVOBKg70-CHCl0ij5GDDO0JJkTOEj2qH7aFImOxvHdn0V",
		RedirectURL:  "http://localhost:8080/callback",
		Scopes:       oAuthScopes,
		Endpoint: oauth2.Endpoint{
			AuthURL:  "https://login.xero.com/identity/connect/authorize",
			TokenURL: "https://identity.xero.com/connect/token",
		},
	}

	return &Handler{&Config{oauthConfig}, "", nil, nil}
}
