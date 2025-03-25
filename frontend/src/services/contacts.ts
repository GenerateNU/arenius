import { Contact, CreateContactRequest, GetContactsResponse, GetContactsRequest } from "../types";
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
    return response.data;

  } catch (error) {
    console.error("Error creating contact:", error);
    return null;
  }
}

function buildQueryParams(filters: GetContactsRequest) {
  const params: Record<string, string | number | undefined> = {};

  if (filters?.search_term) {
    params.search_term = filters.search_term
  }
  if (filters?.pageIndex) {
    params.page = filters.pageIndex + 1;
  }
  if (filters?.pageSize) {
    params.limit = filters.pageSize;
  }

  return params;
}

export async function fetchContacts(
  req: GetContactsRequest,
): Promise<GetContactsResponse> {
  try {
    const response = await apiClient.get(`/contact/company/${req.company_id}`, {
      params: buildQueryParams(req),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching contacts", error);
    return {} as GetContactsResponse;
  }
}
