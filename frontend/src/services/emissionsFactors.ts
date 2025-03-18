import { EmissionsFactorCategories } from "../types";
import apiClient from "./apiClient";

export async function fetchEmissionsFactors(): Promise<
  EmissionsFactorCategories
> {
  try {
    const response = await apiClient.get("/emissions-factor", {
      params: {"companyId": "9a622355-0016-4074-b40d-85d692a4be2b"}
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard items", error);
    return {} as EmissionsFactorCategories;
  }
}
