import axios from "axios";
import {
  ContactEmissions,
  GetContactEmissionsRequest,
  GetGrossEmissionsRequest,
  GrossSummary,
  NetSummary,
} from "@/types";
import apiClient from "./apiClient";

const DEFAULT_GROSS_SUMMARY: GrossSummary = {
  total_co2: 0,
  start_date: new Date(),
  end_date: new Date(),
  months: [],
};

export async function fetchGrossEmissions(
  req: GetGrossEmissionsRequest
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

export async function fetchNetSummary(
  companyId: string,
  startDate: string,
  endDate: string
): Promise<NetSummary[]> {
  try {
    const response = await apiClient.get(
      `/summary/scopes?company_id=${companyId}&start_date=${startDate}&end_date=${endDate}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching emissions", error);
    return [];
  }
}

export async function fetchContactEmissions(
  req: GetContactEmissionsRequest
): Promise<ContactEmissions[]> {
  try {
    const response = await apiClient.get(`/summary/contact/emissions`, {
      params: req,
    });
    return response.data.contact_emissions;
  } catch (error) {
    console.error("Axios Request Failed:", error);
    if (axios.isAxiosError(error) && error.response) {
      console.error("Response Data:", error.response.data);
      console.error("Response Status:", error.response.status);
    }
    throw error;
  }
}
