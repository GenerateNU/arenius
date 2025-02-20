"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Contact, GetContactsRequest} from "@/types";
import { fetchContacts } from "@/services/contacts";

interface ContactsContextValue {
  contacts: Contact[];
  fetchData: () => void;
  req: GetContactsRequest;
  setReq: (req: GetContactsRequest) => void;
}

const ContactContext = createContext<ContactsContextValue | undefined>(
  undefined
);

export const ContactsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [req, setReq] = useState<GetContactsRequest>({company_id: "0a67f5d3-88b6-4e8f-aac0-5137b29917fd"});// TODO: how do I get company id here?

  const fetchData = useCallback(async () => {
    const contacts = await fetchContacts(req);
    setContacts(contacts);
  }, [req]);

  useEffect(() => {
    fetchData();
  }, [fetchData, req]);

  return (
    <ContactContext.Provider
      value={{ contacts, fetchData, req, setReq }}
    >
      {children}
    </ContactContext.Provider>
  );
};

export const useContact = () => {
  const context = useContext(ContactContext);
  if (!context) {
    throw new Error("useContact must be used within a DataProvider");
  }
  return context;
};
