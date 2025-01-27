import apiClient from './apiClient';
import { Item } from "../types";

function filterDictionaryFields(response: Record<string, any>[]): Item[] {
  const filteredItems: Item[] = [];
  for (const item of response) {
    const newItem: Item = {
      id: item['id'],
      description: item['description'],
      quantity: item['quantity'],
      price: item['unit_amount'],
      currencyCode: item['currency_code'],
      co2: item['co2'],
      co2Unit: item['co2_unit']
    }
    filteredItems.push(newItem);
  }
  return filteredItems;
}


export async function fetchDashboardItems(): Promise<Item[]> {
  try {
    const response = await apiClient.get('/line-item', {})
    const items: Record<string, any>[] = response.data;
    return filterDictionaryFields(items);
  } catch (error) {
    console.error("Error fetching dashboard items", error);
    return [];
  }
}

export async function createDashboardItem(item: Item): Promise<void> {

  const new_item = {
    "description": item.description,
    "quantity": item.quantity,
    "unit_amount": item.price,
    "co2": item.co2,
    "co2_unit": item.co2Unit,
    "company_id": "0a67f5d3-88b6-4e8f-aac0-5137b29917fd",
    "contact_id": "b8c4b3e2-08f1-45e9-94a0-125a7e73b4d6",
    "amount": 12
  }

  await apiClient
    .get('/health')
    .then((response) => {
      console.log('Line item created:', response.data);
    })
    .catch((error) => {
      console.log('Error creating line item:', error);
    });
};
