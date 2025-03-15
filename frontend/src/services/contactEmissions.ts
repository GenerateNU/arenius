import { ContactTreeEmissions } from "@/types";
import apiClient from "./apiClient";


export async function fetchGrossEmissions(
    req: string,
  ): Promise<ContactTreeEmissions> {
    try {
      const response = await apiClient.get(`/summary/gross`, {
        params: req,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching gross emissions", error);
      return DEFAULT_GROSS_SUMMARY;
    }
}