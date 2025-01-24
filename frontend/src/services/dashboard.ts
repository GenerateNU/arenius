import apiClient from './apiClient';
import { Item } from "../types";

export async function fetchDashboardItems(): Promise<Item[]> {
  try {
    // real API call would go here. for now, mock data
    return [
      { description: "Lumber from trees", quantity: 1, price: 5000 },
      {
        description: "Shipping lumber cross-country",
        quantity: 1,
        price: 1000,
      },
      { description: "Paint", quantity: 1, price: 1500 },
    ];
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
    "currency_code": item.currencyCode,
    "company_id": "0a67f5d3-88b6-4e8f-aac0-5137b29917fd",
    "contact_id": "b8c4b3e2-08f1-45e9-94a0-125a7e73b4d6",
    "amount": 12
  }
  apiClient
    .post('/line-item', new_item)
    .then((response) => {
      console.log('Line item created:', response.data);
    })
    .catch((error) => {
      console.log('Error creating line item:', error);
    });
};