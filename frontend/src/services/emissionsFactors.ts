import { EmissionsFactorCategories } from "../types";
import apiClient from "./apiClient";

export async function fetchEmissionsFactors(
  searchTerm: string,
  companyId?: string
): Promise<EmissionsFactorCategories> {
  try {
    const response = await apiClient.get("/emissions-factor", {
      params: { company_id: companyId, search_term: searchTerm },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard items", error);
    return {} as EmissionsFactorCategories;
  }
}

export async function setEmissionFactorFavorite(
  companyId: string,
  emissionsFactorId: string,
  setFavorite: boolean
): Promise<null> {
  try {
    await apiClient.post("/emissions-factor/favorite", {
      company_id: companyId, emissions_factor_id: emissionsFactorId, set_favorite: setFavorite
    });
    return null;
  } catch (error) {
    console.error("Error fetching dashboard items", error);
    return null;
  }
}