import { Contact, CreateContactRequest, GetContactsRequest } from "../types";
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

export async function fetchContacts(
  req: GetContactsRequest
): Promise<Contact[]> {
  try {
    const response = await apiClient.get(`/contact/${req.company_id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching contacts", error);
    return [];
  }
}
