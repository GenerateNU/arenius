import {
  CreateLineItemRequest,
  LineItem,
  LineItemFilters,
  ReconcileBatchRequest,
  ReconcileRequest,
} from "../types";
import apiClient from "./apiClient";

function buildQueryParams(filters: LineItemFilters) {
  const params: Record<string, string | Date | undefined> = {};

  if (filters?.dates) {
    params.after_date = filters.dates.from;
    params.before_date = filters.dates.to;
  }

  if (filters?.emissionFactor) {
    params.emission_factor = filters.emissionFactor;
  }
  if (filters?.minPrice) {
    params.min_price = filters.minPrice?.toString();
  }
  if (filters?.maxPrice) {
    params.max_price = filters.maxPrice?.toString();
  }
  if (filters?.searchTerm) {
    params.search_term = filters.searchTerm;
  }
  if (filters?.contactID) {
    params.search_term = filters.contactID;
  }

  return params;
}

export async function fetchLineItems(
  filters: LineItemFilters
): Promise<LineItem[]> {
  try {
    const response = await apiClient.get("/line-item", {
      params: buildQueryParams(filters),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard items", error);
    return [];
  }
}

export async function createLineItem(
  item: CreateLineItemRequest
): Promise<void> {
  const new_item = {
    description: item.description,
    total_amount: item.total_amount,
    currency_code: item.currency_code,
    company_id: "0a67f5d3-88b6-4e8f-aac0-5137b29917fd",
    contact_id: "b8c4b3e2-08f1-45e9-94a0-125a7e73b4d6",
    amount: 12,
  };

  await apiClient
    .post("/line-item", new_item)
    .then((response) => {
      console.log("Line item created:", response.data);
    })
    .catch((error) => {
      console.log("Error creating line item:", error);
    });
}

export async function reconcileBatch(request: ReconcileBatchRequest) {
  try {
    await apiClient.patch("/line-item/batch", {
      line_item_ids: request.lineItemIds,
      scope: request.scope,
      emissions_factor_id: request.emissionsFactorId,
    });
  } catch (error) {
    console.error("Error updating dashboard items", error);
  }
}

export async function reconcile(request: ReconcileRequest) {
  try {
    await apiClient.patch(`line-item/${request.lineItemId}`, {
      scope: request.scope,
      emission_factor: request.emissionsFactorId,
      contact_id: request.contactId,
    });
  } catch (error) {
    console.error("Error updating dashboard items", error);
  }
}
