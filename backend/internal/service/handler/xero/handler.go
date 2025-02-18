package xero

import (
	"arenius/internal/storage"
	"net/http"
	"os"

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
	lineItemRepository     storage.LineItemRepository
	companyRepository      storage.CompanyRepository
	contactRepository      storage.ContactRepository
	UserRepository         storage.UserRepository
}

func NewHandler(lineItemRepository storage.LineItemRepository, companyRepository storage.CompanyRepository, contactRepository storage.ContactRepository, userRepository storage.UserRepository) *Handler {
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

	return &Handler{&Config{oauthConfig}, "", nil, nil, lineItemRepository, companyRepository, contactRepository, userRepository}
}
