import { ContactEmissions, GetContactEmissionsRequest } from "@/types";
import apiClient from "./apiClient";
import axios from "axios";

// const DEFAULT: ContactEmissions[] = [
//   {
//     contact_id: "",
//     contact_name: "",
//     carbon: 0,
//   }
// ];

export async function fetchContactEmissions(
    req: GetContactEmissionsRequest,
  ): Promise<ContactEmissions[]> {
    try {
      const response = await apiClient.get(`/summary/contact/emissions`, {
        params: req,
      });
      console.log("Contact Emissions Response:", response.data);
      console.log("Contact Emissions Response:", response.data.contact_emissions);
      return response.data.contact_emissions;
    } catch (error) {
      console.error("Axios Request Failed:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.error("Response Data:", error.response.data);
        console.error("Response Status:", error.response.status);
      }
      throw error; // Re-throw for handling
    }
    // try {
    //   const response = await apiClient.get(`/summary/contact/emissions`, {
    //     params: req,
    //   });
    //   console.log("Contact Emissions Response:", response.data);
    //   return response.data;
    // } catch (error) {
    //   console.error("Error fetching gross emissions", error);
    //   return DEFAULT;
    // }
}