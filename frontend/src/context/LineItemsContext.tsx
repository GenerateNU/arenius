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

interface LineItemsContextValue {
  items: LineItem[];
  fetchData: () => void;
  filters: LineItemFilters;
  setFilters: (filters: LineItemFilters) => void;
}

const LineItemsContext = createContext<LineItemsContextValue | undefined>(
  undefined
);

export const LineItemsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<LineItem[]>([]);
  const [filters, setFilters] = useState<LineItemFilters>({});

  const fetchData = useCallback(async () => {
    const items = await fetchLineItems(filters);
    setItems(items);
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData, filters]);

  return (
    <LineItemsContext.Provider
      value={{ items, fetchData, filters, setFilters }}
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
