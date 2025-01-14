package climatiq

import (
	"fmt"
	"net/http"
	"net/url"
	"os"

	"github.com/joho/godotenv"
)

const (
	defaultBaseURL   = "https://api.climatiq.io/"
	defaultUserAgent = "go-climatiq"
)

type clientOpts func(*Client)

// Client is the structure use to communicate with the climatiq API
type Client struct {
	// HTTP client used to communicate with the API.
	client *http.Client

	// base URL for API requests.
	// defaults to the public climatiq api
	baseURL *url.URL

	// user agent used to make requests
	userAgent string

	// token is used for authentication to the climatiq API
	token string
}

// NewClient returns an instantiated instance of a client
// with the ability to override values with various options
func NewClient(opts ...clientOpts) *Client {
	err := godotenv.Load()
	if err != nil {
		fmt.Println("Error loading .env file")
	}

	u, _ := url.Parse(defaultBaseURL)
	c := &Client{
		client:    &http.Client{},
		baseURL:   u,
		userAgent: defaultUserAgent,
		token:     os.Getenv("CLIMATIQ_KEY"),
	}

	// add options
	for _, opt := range opts {
		opt(c)
	}

	return c
}

// Do is used to make the actual http requests
func (c *Client) Do(r *http.Request) (*http.Response, error) {
	// Set JSON headers
	r.Header.Set("Content-Type", "application/json; charset=utf-8")
	r.Header.Set("Accept", "application/json; charset=utf-8")

	// Add authorization header with API token
	r.Header.Add("Authorization", fmt.Sprintf("Bearer %s", c.token))

	// Add user agent header
	r.Header.Set("User-Agent", c.userAgent)

	return c.client.Do(r)
}
