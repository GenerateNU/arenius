package ctxt

import (
	"arenius/internal/service/climatiq"
	"fmt"

	"github.com/gofiber/fiber/v2"
)

type climatiqKey struct{}

func SetClimatiqClient(c *fiber.Ctx, client *climatiq.Client) {
	c.Locals(climatiqKey{}, client)
}

func GetClimatiqClient(c *fiber.Ctx) (*climatiq.Client, error) {
	client, ok := c.Locals(climatiqKey{}).(*climatiq.Client)
	if !ok {
		return nil, fmt.Errorf("unexpected climatiq client. got: %v", client)
	}
	return client, nil
}
