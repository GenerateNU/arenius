"use client";

import { GetLineItemResponse, LineItemFilters } from "@/types";
import { fetchLineItems } from "@/services/lineItems";
import {
  useState,
  useCallback,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { createDataContext, DataContextValue } from "./Context";

interface LineItemsContextValue
  extends DataContextValue<GetLineItemResponse, LineItemFilters> {
  reconciledData: GetLineItemResponse;
  unreconciledData: GetLineItemResponse;
}

// Create a new context for line items
const LineItemsContext = createContext<LineItemsContextValue | undefined>(
  undefined
);

export const LineItemsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { DataProvider: BaseDataProvider, useData } = createDataContext<
    GetLineItemResponse,
    LineItemFilters
  >();

  return (
    <BaseDataProvider fetchFunction={fetchLineItems}>
      <LineItemsProviderInner useData={useData}>
        {children}
      </LineItemsProviderInner>
    </BaseDataProvider>
  );
};

const LineItemsProviderInner: React.FC<{
  children: ReactNode;
  useData: any;
}> = ({ children, useData }) => {
  const { companyId, isLoading } = useAuth();
  const { filters, setFilters, pagination, setPagination } = useData();
  const [reconciledData, setReconciledData] = useState<GetLineItemResponse>();
  const [unreconciledData, setUnreconciledData] =
    useState<GetLineItemResponse>();

  const fetchAllLineItems = useCallback(async () => {
    if (!companyId || isLoading) {
      return;
    }

    const commonFilters = {
      ...filters,
      ...pagination,
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
  }, [filters, companyId, isLoading, pagination]);

  useEffect(() => {
    fetchAllLineItems();
  }, [fetchAllLineItems]);

  return (
    <LineItemsContext.Provider
      value={{
        ...useData(),
        filters,
        setFilters,
        reconciledData,
        unreconciledData,
        pagination,
        setPagination,
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
