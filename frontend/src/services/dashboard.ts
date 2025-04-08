import axios from "axios";
import {
  ContactEmissions,
  GetContactEmissionsRequest,
  GetEmissionsRequest,
  EmissionSummary,
  ScopeBreakdown,
} from "@/types";
import apiClient from "./apiClient";

const DEFAULT_GROSS_SUMMARY: EmissionSummary = {
  gross_co2: 0,
  net_co2: 0,
  start_date: new Date(),
  end_date: new Date(),
  months: [],
};

export async function fetchEmissions(
  req: GetEmissionsRequest
): Promise<EmissionSummary> {
  try {
    const response = await apiClient.get(`/summary/emissions`, {
      params: req,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching emissions", error);
    return DEFAULT_GROSS_SUMMARY;
  }
}

export async function fetchScopeBreakdown(
  companyId: string,
  startDate: string,
  endDate: string
): Promise<ScopeBreakdown[]> {
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

export async function fetchTopEmissions(req: GetEmissionsRequest, jwt: string) {
  try {
    const response = await apiClient.get("/summary/top-emissions", {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      params: req,
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching emissions factors:", error);
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
