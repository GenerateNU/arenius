"use client";

import { GetContactsResponse, GetContactsRequest } from "@/types";
import { createDataContext } from "./Context";

export const { DataProvider: ContactsProvider, useData: useContacts } =
  createDataContext<GetContactsResponse, GetContactsRequest>();