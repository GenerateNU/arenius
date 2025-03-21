import { ContactEmissions, GetContactEmissionsRequest } from "@/types";
import apiClient from "./apiClient";
import axios from "axios";

export async function fetchContactEmissions(
    req: GetContactEmissionsRequest,
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