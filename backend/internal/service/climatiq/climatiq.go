package climatiq

import (
	"fmt"
	"net/http"
	"net/url"
	"os"
)

const (
	defaultBaseURL = "https://api.climatiq.io/"
)

type clientOpts func(*Client)

// Client is the structure use to communicate with the climatiq API
type Client struct {
	// HTTP client used to communicate with the API.
	client *http.Client

	// base URL for API requests.
	// defaults to the public climatiq api
	baseURL *url.URL

	// token is used for authentication to the climatiq API
	token string
}

// NewClient returns an instantiated instance of a client
// with the ability to override values with various options
func NewClient(opts ...clientOpts) *Client {

	u, _ := url.Parse(defaultBaseURL)
	c := &Client{
		client:  &http.Client{},
		baseURL: u,
		token:   os.Getenv("CLIMATIQ_KEY"),
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

	return c.client.Do(r)
}
