"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "@/context/AuthContext";
import { Pagination } from "@/types";

interface DataProviderProps<T extends object, F extends object> {
  children: React.ReactNode;
  fetchFunction: (filters: F) => Promise<T>;
}

interface DataContextValue<T extends object, F extends object> {
  data: T;
  fetchData: () => void;
  filters: F;
  setFilters: (filters: F) => void;
  pagination: Pagination
  setPagination: (pag: Pagination) => void;
}


export const createDataContext = <T extends object, F extends object>() => {
  const DataContext = createContext<DataContextValue<T, F> | undefined>(undefined);

  const DataProvider: React.FC<DataProviderProps<T, F>> = ({ children, fetchFunction }) => {
    const [data, setData] = useState<T>({} as T);
    const [filters, setFilters] = useState<F>({} as F);
    const [pagination, setPagination] = useState<Pagination>({} as Pagination)
    const { companyId, tenantId, isLoading } = useAuth(); // Using `companyId` and `isLoading`

    const fetchData = useCallback(async () => {
      if (isLoading) {
        console.log("Authentication is still in progress. Please wait...");
        return;  // Don't fetch data if the auth process is still ongoing
      }

      if (!companyId) {
        console.log("Company ID is not available yet");
        return;  // Don't fetch if companyId is not available
      }

      try {
        console.log("fetching");
        const result = await fetchFunction({ ...filters, ...pagination, company_id: companyId, tenant_id: tenantId });
        setData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }, [filters, fetchFunction, companyId, tenantId, isLoading, pagination]);  // Add `isLoading` to dependencies

    useEffect(() => {
      if (companyId) {
        fetchData();
      }
    }, [companyId, fetchData]); // Fetch data when companyId or filters change

    if (isLoading) {
      return <div>Loading...</div>;  // Or any loading state you want
    }

    return (
      <DataContext.Provider value={{ data, fetchData, filters, setFilters, pagination, setPagination }}>
        {children}
      </DataContext.Provider>
    );
  };

  const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
      throw new Error("useData must be used within a DataProvider");
    }
    return context;
  };

  return { DataProvider, useData };
};
