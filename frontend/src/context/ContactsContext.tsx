"use client";

import { Contact, GetContactsRequest } from "@/types";
import { createDataContext } from "./Context";

export const { DataProvider: ContactsProvider, useData: useContacts } =
  createDataContext<Contact[], GetContactsRequest>();