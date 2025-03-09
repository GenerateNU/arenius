import { GetGrossEmissionsRequest, GrossSummary } from "@/types";
import apiClient from "./apiClient";

const DEFAULT_GROSS_SUMMARY: GrossSummary = {
    total_co2: 0,
    start_date: new Date(),
    end_date: new Date(),
    months: []
};

export async function fetchGrossEmissions(
    req: GetGrossEmissionsRequest,
  ): Promise<GrossSummary> {
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