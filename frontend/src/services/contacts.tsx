"use client";

import { Contact, GetContactsRequest } from "@/types";
import apiClient from "./apiClient";

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