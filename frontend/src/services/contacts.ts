import { Contact, CreateContactRequest, GetContactsRequest } from "../types";
import apiClient from "./apiClient";

export async function createContact(
  contact: CreateContactRequest,
  companyId: string
): Promise<Contact | null> {
  try {
    const new_contact = {
      ...contact,
      company_id: companyId,
    };

    const response = await apiClient.post("/contact", new_contact);
    console.log("Contact created:", response.data);
    return response.data;

  } catch (error) {
    console.error("Error creating contact:", error);
    return null;
  }
}

export async function fetchContacts(
  req: GetContactsRequest,
): Promise<Contact[]> {
  try {
    const response = await apiClient.get(`/contact/company/${req.company_id}`, {
      params: req,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching contacts", error);
    return [];
  }
}
