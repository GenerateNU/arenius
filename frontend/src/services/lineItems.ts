import {
  CreateLineItemRequest,
  GetLineItemResponse,
  LineItemFilters,
  ReconcileBatchRequest,
  ReconcileRequest,
} from "../types";
import apiClient from "./apiClient";

function buildQueryParams(filters: LineItemFilters) {
  const params: Record<string, string | Date | number | boolean | undefined> =
    {};

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
  if (filters?.reconciliationStatus) {
    params.reconciliation_status = filters.reconciliationStatus;
  }
  if (filters?.searchTerm) {
    params.search_term = filters.searchTerm;
  }
  if (filters?.scope !== undefined) {
    params.scope = filters.scope;
  }
  if (filters?.company_id) {
    params.company_id = filters.company_id;
  }
  if (filters?.contact_id) {
    params.contact_id = filters.contact_id;
  }
  if (filters?.pageIndex) {
    params.page = filters.pageIndex;
  }
  if (filters?.pageSize) {
    params.limit = filters.pageSize;
  }

  params.unpaginated = true;

  return params;
}

export async function fetchLineItems(
  filters: LineItemFilters
): Promise<GetLineItemResponse> {
  try {
    const response = await apiClient.get("/line-item", {
      params: buildQueryParams(filters),
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard items", error);
    return {} as GetLineItemResponse;
  }
}

export async function createLineItem(
  item: CreateLineItemRequest,
  companyId: string
): Promise<void> {
  const new_item = {
    description: item.description,
    total_amount: item.total_amount,
    currency_code: item.currency_code,
    company_id: companyId,
    contact_id: item.contact_id,
    emission_factor_id: item.emission_factor_id,
    scope: item.scope,
    date: new Date(item.date).toISOString(),
    co2: item.co2,
    co2_unit: item.co2_unit,
  };

  if (item.transaction_type === "offset") {
    new_item.scope = 0;
  }
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

export async function reconcileBatchOffset(request: ReconcileBatchRequest) {
  try {
    // await apiClient.post("/carbon-offset/batch", request);
    await apiClient.patch("/line-item/batch/offset", {
      line_item_ids: request.lineItemIds,
      scope: 0,
      co2: request.co2,
    });
  } catch (error) {
    console.error("Error reconciling carbon offsets", error);
  }
}

export async function reconcile(request: ReconcileRequest) {
  try {
    if (request.scope === 0) {
      await apiClient.patch(`line-item/offset/${request.lineItemId}`, {
        co2: request.co2,
        scope: request.scope,
        contact_id: request.contactId,
      });
    } else {
      await apiClient.patch(`line-item/${request.lineItemId}`, {
        scope: request.scope,
        emission_factor: request.emissionsFactorId,
        contact_id: request.contactId,
      });
    }
  } catch (error) {
    console.error("Error updating dashboard items", error);
  }
}

export async function handleRecommendation(
  lineItemId: string,
  accept: boolean
) {
  try {
    await apiClient.patch(
      `line-item/handle-recommendation/${lineItemId}?accept=${accept}`
    );
  } catch (error) {
    console.error("Error updating dashboard items", error);
  }
}
