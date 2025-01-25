package carbon

import (
	"arenius/internal/service/climatiq"
	"arenius/internal/service/ctxt"
	"net/http"

	"github.com/gofiber/fiber/v2"
)

func (h *Handler) SearchEmissionFactors(c *fiber.Ctx) error {
	climatiqClient, err := ctxt.GetClimatiqClient(c)
	if err != nil {
		return c.Status(http.StatusInternalServerError).SendString(err.Error())
	}

	searchRequest := &climatiq.SearchRequest{
		DataVersion: "^5",
		Region:      "US",
	}
	response, err := climatiqClient.Search(c.Context(), searchRequest)
	if err != nil {
		return c.Status(http.StatusInternalServerError).SendString(err.Error())
	}

	return c.JSON(response)
}
