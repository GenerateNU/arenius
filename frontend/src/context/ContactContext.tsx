"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "@/context/AuthContext";
import { PaginationState } from "@tanstack/react-table";
import { GetContactsRequest, GetContactsResponse } from "@/types"; // Assuming Contact type is defined in your types
import { fetchContacts } from "@/services/contacts"; // Assuming this is your fetch function

interface ContactContextValue {
  data: GetContactsResponse;
  fetchData: () => void;
  filters: GetContactsRequest;
  setFilters: (
    update:
      | GetContactsRequest
      | ((prevFilters: GetContactsRequest) => GetContactsRequest)
  ) => void;
  pagination: PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
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
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 1,
    pageSize: 10,
  });
  const { companyId, tenantId, isLoading } = useAuth();

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
        ...pagination,
        company_id: companyId,
      });
      setData(result);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  }, [filters, pagination, companyId, tenantId, isLoading]);

  useEffect(() => {
    if (!isLoading && companyId) {
      fetchData();
    }
  }, [companyId, fetchData, filters, isLoading, pagination]);

  if (isLoading) {
    return <div>Loading...</div>; // Or any loading state you want
  }

  return (
    <ContactContext.Provider
      value={{
        data,
        fetchData,
        filters,
        setFilters,
        pagination,
        setPagination,
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
