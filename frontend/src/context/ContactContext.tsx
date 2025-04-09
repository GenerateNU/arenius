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
  fetchData: () => Promise<void>;
  filters: GetContactsRequest;
  setFilters: (
    update:
      | GetContactsRequest
      | ((prevFilters: GetContactsRequest) => GetContactsRequest)
  ) => void;
  isLoading: boolean; // Add loading state
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
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const { user, isLoading: authLoading } = useAuth();

  const fetchData = useCallback(async () => {
    if (authLoading) {
      console.log("Authentication is still in progress. Please wait...");
      return;
    }

    if (!user) {
      console.log("Company ID is not available yet");
      return;
    }

    setIsLoading(true); // Start loading

    try {
      console.log("Fetching contacts...");
      const result = await fetchContacts({
        ...filters,
        company_id: user.company_id,
      });
      setData(result);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setIsLoading(false); // End loading regardless of success/failure
    }
  }, [filters, user, authLoading]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchData();
    }
  }, [user, fetchData, filters, authLoading]);

  return (
    <ContactContext.Provider
      value={{
        data,
        fetchData,
        filters,
        setFilters,
        isLoading,
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