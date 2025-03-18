import { EmissionsFactorCategories } from "../types";
import apiClient from "./apiClient";

export async function fetchEmissionsFactors(companyId: string | null): Promise<
  EmissionsFactorCategories
> {
  try {
    const response = await apiClient.get("/emissions-factor", {
      params: { companyId: companyId }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard items", error);
    return {} as EmissionsFactorCategories;
  }
}
