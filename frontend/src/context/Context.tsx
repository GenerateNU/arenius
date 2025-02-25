"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

interface DataProviderProps<T extends object, F extends object> {
  children: React.ReactNode;
  fetchFunction: (filters: F) => Promise<T[]>;
}

interface DataContextValue<T extends object, F extends object> {
  data: T[];
  fetchData: () => void;
  filters: F;
  setFilters: (filters: F) => void;
}

export const createDataContext = <T extends object, F extends object>() => {
  const DataContext = createContext<DataContextValue<T, F> | undefined>(
    undefined
  );

  const DataProvider: React.FC<DataProviderProps<T, F>> = ({
    children,
    fetchFunction,
  }) => {
    const [data, setData] = useState<T[]>([]);
    const [filters, setFilters] = useState<F>({} as F);

    const fetchData = useCallback(async () => {
      const result = await fetchFunction({...filters, company_id: "0a67f5d3-88b6-4e8f-aac0-5137b29917fd"});
      setData(result);
    }, [filters, fetchFunction]);

    useEffect(() => {
      fetchData();
    }, [fetchData]);

    return (
      <DataContext.Provider value={{ data, fetchData, filters, setFilters }}>
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
