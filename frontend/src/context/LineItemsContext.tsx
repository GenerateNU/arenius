"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { fetchLineItems } from "@/services/lineItems";
import { LineItem, LineItemFilters } from "@/types";
import { useAuth } from "./AuthContext";

interface LineItemsContextValue {
  reconciledData: LineItem[];
  unreconciledData: LineItem[];
  fetchData: () => void;
  filters: LineItemFilters;
  setFilters: (filters: LineItemFilters) => void;
  loading: boolean;
}

const LineItemsContext = createContext<LineItemsContextValue | undefined>(
  undefined
);

export const LineItemsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [reconciledData, setReconciledData] = useState<LineItem[]>([]);
  const [unreconciledData, setUnreconciledData] = useState<LineItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<LineItemFilters>({});
  const { companyId, isLoading } = useAuth();

  const fetchData = useCallback(async () => {
    if (!companyId || isLoading) {
      return;
    }

    const commonFilters = {
      ...filters,
      company_id: companyId,
    };

    const reconciled = await fetchLineItems({
      ...commonFilters,
      reconciled: true,
    });
    setReconciledData(reconciled);

    const unreconciled = await fetchLineItems({
      ...commonFilters,
      reconciled: false,
    });
    setUnreconciledData(unreconciled);
  }, [filters]);

  useEffect(() => {
    setLoading(true);
    fetchData();
    setLoading(false);
  }, [fetchData, filters]);

  return (
    <LineItemsContext.Provider
      value={{
        reconciledData,
        unreconciledData,
        fetchData,
        filters,
        setFilters,
        loading,
      }}
    >
      {children}
    </LineItemsContext.Provider>
  );
};

export const useLineItems = () => {
  const context = useContext(LineItemsContext);
  if (!context) {
    throw new Error("useLineItems must be used within a DataProvider");
  }
  return context;
};
