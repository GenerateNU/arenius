package lineItem

import (
	"arenius/internal/models"
	"arenius/internal/service/climatiq"
	"arenius/internal/service/ctxt"
	"context"
	"fmt"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"golang.org/x/sync/errgroup"
)

func (h *Handler) ReconcileAndEstimate(ctx *fiber.Ctx, lineItemIDs []uuid.UUID, scope *int, emissionsFactorID *string, contactID *string) error {
	// Step 1: Update Line Items in Supabase
	if contactID != nil && len(lineItemIDs) == 1 {
		_, err := h.lineItemRepository.ReconcileLineItem(ctx.Context(), lineItemIDs[0].String(), *scope, *emissionsFactorID, contactID, nil, nil)
		if err != nil {
			return fmt.Errorf("error updating line items: %w", err)
		}
	} else {
		err := h.lineItemRepository.BatchUpdateLineItems(ctx.Context(), lineItemIDs, scope, emissionsFactorID, nil, nil)
		if err != nil {
			return fmt.Errorf("error updating line items: %w", err)
		}
	}

	// Step 2: Fetch updated Line Items for Estimation
	lineItems, err := h.lineItemRepository.GetLineItemsByIds(ctx.Context(), lineItemIDs)
	if err != nil {
		return fmt.Errorf("error fetching line items: %w", err)
	}

	// Step 3: Prepare estimation requests
	var estimates []climatiq.EstimateRequest
	for _, item := range lineItems {
		if item.EmissionFactorId == nil || *item.EmissionFactorId == "" {
			continue // Skip items without an emissions factor
		}

		estimates = append(estimates, climatiq.EstimateRequest{
			EmissionFactor: climatiq.EmissionFactor{
				ActivityID:  *item.EmissionFactorId,
				DataVersion: "^20",
			},
			Parameters: climatiq.Parameters{
				Money:     item.TotalAmount,
				MoneyUnit: strings.ToLower(item.CurrencyCode),
			},
		})
	}

	// Avoid making API calls if there are no estimates to process
	if len(estimates) == 0 {
		return nil
	}

	// Get Climatiq Client outside the goroutine
	climatiqClient, err := ctxt.GetClimatiqClient(ctx)
	if err != nil || climatiqClient == nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to get Climatiq client"})
	}

	// Copy context to prevent usage of expired Fiber context inside goroutine
	bgCtx := ctx.Context()

	// Step 4: Estimate emissions concurrently
	go func(client *climatiq.Client, bgCtx context.Context) {
		response, err := client.BatchEstimate(bgCtx, &estimates)
		if err != nil {
			fmt.Println("Error estimating carbon emissions:", err)
			return
		}

		// Step 5: Update Line Items with Emissions Data
		var eg errgroup.Group
		for i, result := range response.Results {
			i, result := i, result // Capture loop variable
			eg.Go(func() error {
				updateReq := models.LineItemEmissionsRequest{
					LineItemId: lineItems[i].ID,
					CO2:        result.CO2e,
					CO2Unit:    result.CO2eUnit,
				}
				_, err := h.lineItemRepository.AddLineItemEmissions(bgCtx, updateReq)
				return err
			})
		}

		// Wait for all updates to complete
		if err := eg.Wait(); err != nil {
			fmt.Println("Error updating line item emissions:", err)
		}
	}(climatiqClient, bgCtx) // Pass copied context

	return nil
}
