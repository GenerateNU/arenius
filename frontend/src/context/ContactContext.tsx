"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import { useAuth } from "@/context/AuthContext";
import { fetchContacts } from "@/services/contacts";
import { GetContactsRequest, GetContactsResponse } from "@/types";

interface ContactContextValue {
  data: GetContactsResponse;
  fetchData: () => void;
  filters: GetContactsRequest;
  setFilters: (
    update:
      | GetContactsRequest
      | ((prevFilters: GetContactsRequest) => GetContactsRequest)
  ) => void;
}

const ContactContext = createContext<ContactContextValue | undefined>(
  undefined
);

export const ContactProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [data, setData] = useState<GetContactsResponse>(
    {} as GetContactsResponse
  );
  const [filters, setFilters] = useState<GetContactsRequest>(
    {} as GetContactsRequest
  );
  const { companyId, isLoading } = useAuth();

  const fetchData = useCallback(async () => {
    if (isLoading) {
      console.log("Authentication is still in progress. Please wait...");
      return;
    }

    if (!companyId) {
      console.log("Company ID is not available yet");
      return;
    }

    try {
      console.log("Fetching contacts...");
      const result = await fetchContacts({
        ...filters,
        company_id: companyId,
      });
      setData(result);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  }, [filters, companyId, isLoading]);

  useEffect(() => {
    if (!isLoading && companyId) {
      fetchData();
    }
  }, [companyId, fetchData, filters, isLoading]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ContactContext.Provider
      value={{
        data,
        fetchData,
        filters,
        setFilters,
      }}
    >
      {children}
    </ContactContext.Provider>
  );
};

export const useContacts = () => {
  const context = useContext(ContactContext);
  if (!context) {
    throw new Error("useContacts must be used within a ContactProvider");
  }
  return context;
};
