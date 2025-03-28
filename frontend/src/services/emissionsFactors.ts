import { EmissionsFactorCategories } from "../types";
import apiClient from "./apiClient";

export async function fetchEmissionsFactors(
  searchTerm: string,
  companyId?: string
): Promise<EmissionsFactorCategories> {
  try {
    const response = await apiClient.get("/emissions-factor", {
      params: { companyId: companyId, searchTerm: searchTerm },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard items", error);
    return {} as EmissionsFactorCategories;
  }
}
