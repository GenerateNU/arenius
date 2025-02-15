import { EmissionsFactorCategory } from "../types";
import apiClient from "./apiClient";

export async function fetchEmissionsFactors(): Promise<
  EmissionsFactorCategory[]
> {
  try {
    const response = await apiClient.get("/emissions-factor");
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard items", error);
    return [];
  }
}
