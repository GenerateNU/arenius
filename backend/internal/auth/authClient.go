package auth

import (
	"net/http"
	"time"
)

// Singleton HTTP client instance
var Client = &http.Client{
	Timeout: 10 * time.Second, // Set timeout for requests
}
