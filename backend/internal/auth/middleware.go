package auth

import (
	"arenius/internal/config"
	"arenius/internal/errs"
	"fmt"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	Email string `json:"email"`
	jwt.RegisteredClaims
}

func parseJWTToken(token string, hmacSecret []byte) (email string, err error) {
	t, err := jwt.ParseWithClaims(token, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}

		return hmacSecret, nil
	})

	if err != nil {
		return "", fmt.Errorf("error validating token: %v", err)
	} else if claims, ok := t.Claims.(*Claims); ok {
		return claims.Email, nil
	}

	return "", fmt.Errorf("error parsing token: %v", err)
}

func Middleware(cfg *config.Supabase) fiber.Handler {

	return func(c *fiber.Ctx) error {

		token := c.Get("Authorization", "")
		token = strings.TrimPrefix(token, "Bearer ")

		if token == "" {
			return errs.BadRequest("token not found")
		}
		_, err := parseJWTToken(token, []byte(cfg.JWTSecret))

		if err != nil {
			return errs.BadRequest("error parsing token")
		}
		return c.Next()
	}
}
