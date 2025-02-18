import { CreateContactRequest } from "../types";
import apiClient from "./apiClient";

export async function createContact(
  contact: CreateContactRequest
): Promise<void> {
  const new_contact = {
    ...contact,
    company_id: "0a67f5d3-88b6-4e8f-aac0-5137b29917fd",
  };

  await apiClient
    .post("/contact", new_contact)
    .then((response) => {
      console.log("Contact created:", response.data);
    })
    .catch((error) => {
      console.log("Error creating contact:", error);
    });
}
