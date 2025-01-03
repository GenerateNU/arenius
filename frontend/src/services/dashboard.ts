import { Item } from "../types";

export async function fetchDashboardItems(): Promise<Item[]> {
  // real API call would go here. for now, mock data
  return [
    { name: "Lumber", description: "Lumber from trees", price: 5000 },
    {
      name: "Shipping",
      description: "Shipping lumber cross-country",
      price: 1000,
    },
    { name: "Paint", description: "Paint", price: 1500 },
  ];
}
