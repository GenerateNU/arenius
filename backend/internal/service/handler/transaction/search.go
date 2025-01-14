package transaction

import (
	"arenius/internal/service/ctxt"
	"encoding/json"
	"net/http"

	"github.com/gofiber/fiber/v2"
)

func (h *Handler) Search(c *fiber.Ctx) error {
	climatiqClient, err := ctxt.GetClimatiqClient(c)
	if err != nil {
		return c.Status(http.StatusInternalServerError).SendString(err.Error())
	}

	queryParams := map[string]string{
		"data_version": "19",
		"query":        "coal",
	}
	response, err := climatiqClient.SearchData(queryParams)
	if err != nil {
		return c.Status(http.StatusInternalServerError).SendString(err.Error())
	}

	var result map[string]interface{}
	err = json.Unmarshal([]byte(response), &result)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	// Send the decoded JSON response
	return c.JSON(result)
}
