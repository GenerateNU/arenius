import { CreateLineItemRequest, Item } from "../types";
import apiClient from "./apiClient";

export async function fetchLineItems(): Promise<Item[]> {
  try {
    const response = await apiClient.get("/line-item", {});
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
    quantity: 1,
    unit_amount: item.unit_amount,
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
