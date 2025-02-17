"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchLineItems } from "@/services/lineItems";
import { LineItem } from "@/types";

interface LineItemsContextValue {
  items: LineItem[];
  fetchData: () => void;
}

const LineItemsContext = createContext<LineItemsContextValue | undefined>(
  undefined
);

export const LineItemsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<LineItem[]>([]);

  const fetchData = async () => {
    const items = await fetchLineItems();
    setItems(items);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <LineItemsContext.Provider value={{ items, fetchData }}>
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
