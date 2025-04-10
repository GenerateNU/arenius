package xero

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
)

func (h *Handler) getRecommendationsForCompany(ctx *fiber.Ctx, companyID string) error {
	// Create a new request to the line-item/get-recommendations endpoint
	// We need to create an internal request because we're not going through the normal HTTP route
	req := ctx.App().AcquireCtx(ctx.Context())
	defer ctx.App().ReleaseCtx(req)

	// Set the original request headers (especially authentication)
	ctx.Request().Header.VisitAll(func(key, value []byte) {
		req.Request().Header.SetBytesV(string(key), value)
	})

	fmt.Println("Requesting recommendations for company:", companyID)
	req.Request().Header.SetMethod(fiber.MethodGet)
	// Set request path and query parameters
	req.Request().SetRequestURI("/line-item/get-recommendations")
	req.Request().URI().QueryArgs().Set("company_id", companyID)

	// Execute the request
	ctx.App().Handler()(req.Context())
	if req.Response().StatusCode() >= 400 {
		return fmt.Errorf("error making internal request to get-recommendations: status code %d", req.Response().StatusCode())
	}

	// Check the response status
	status := req.Response().StatusCode()
	if status != fiber.StatusOK {
		body := req.Response().Body()
		return fmt.Errorf("get-recommendations returned non-OK status %d: %s", status, string(body))
	}

	return nil
}
