import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { fetchLineItems } from "@/services/lineItems";
import { GetLineItemResponse, LineItem, LineItemFilters } from "@/types";
import { useAuth } from "./AuthContext";

const TABLES = [
  "reconciled",
  "unreconciled",
  "recommended",
  "offsets",
] as const;
export type TableKey = (typeof TABLES)[number];

type SCOPES = ["scope1", "scope2", "scope3"];
export type ScopeKey = SCOPES[number];

type ViewMode = "paginated" | "scoped";

interface TableContextType {
  activePage: TableKey;
  setActiveTable: (table: TableKey) => void;
  tableData: Record<TableKey | ScopeKey, LineItem[]>;
  fetchTableData: (table: TableKey, filters: LineItemFilters) => Promise<void>;
  fetchAllData: () => Promise<void>;
  loading: boolean;
  error: string | null;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  filters: LineItemFilters;
  setFilters: (
    update:
      | LineItemFilters
      | ((prevFilters: LineItemFilters) => LineItemFilters)
  ) => void;
}

const TransactionContext = createContext<TableContextType | undefined>(
  undefined
);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [activePage, setActivePage] = useState<TableKey>("reconciled");
  const [viewMode, setViewMode] = useState<"paginated" | "scoped">("scoped");
  const [tableData, setTableData] = useState<
    Record<TableKey | ScopeKey, LineItem[]>
  >({
    reconciled: [],
    scope1: [],
    scope2: [],
    scope3: [],
    unreconciled: [],
    recommended: [],
    offsets: [],
  });

  const [filters, setFilters] = useState<LineItemFilters>({});

  const { companyId } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function filterByScope(reconciledData: GetLineItemResponse) {
    const scope1 = reconciledData.line_items.filter((item) => item.scope === 1);
    const scope2 = reconciledData.line_items.filter((item) => item.scope === 2);
    const scope3 = reconciledData.line_items.filter((item) => item.scope === 3);
    return { scope1, scope2, scope3 };
  }

  // Fetch data for the active table only
  const fetchTableData = useCallback(
    async (table: TableKey) => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchLineItems({
          ...filters,
          reconciliationStatus: table,
          company_id: companyId,
        });

        if (table === "reconciled") {
          const { scope1, scope2, scope3 } = filterByScope(data);
          setTableData((prev) => ({
            ...prev,
            [table]: data.line_items,
            scope1,
            scope2,
            scope3,
          }));
        } else {
          setTableData((prev) => ({
            ...prev,
            [table]: data.line_items,
          }));
        }
      } catch (err) {
        setError(`Failed to load data: ${err}`);
      }

      console.log("tableData", tableData);
      console.log("filters", filters);
      setLoading(false);
    },
    [companyId, filters]
  );

  // Fetch all data for all tables and scopes
  const fetchAllData = useCallback(async () => {
    if (!companyId) return;

    setLoading(true);
    setError(null);

    try {
      await Promise.all(TABLES.map((table) => fetchTableData(table)));
    } catch (err) {
      setError(`Failed to load data: ${err}`);
    }

    setLoading(false);
  }, [companyId, fetchTableData]);

  // // Fetch all data on mount when companyId becomes available
  useEffect(() => {
    if (companyId) {
      fetchAllData();
    }
  }, [companyId, fetchAllData]);

  // Fetch data for the current table when the filters change
  useEffect(() => {
    if (companyId) {
      fetchTableData(activePage);
    }
    // ignoring activePage in this dependency array since we don't need to refetch on page change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, filters, fetchTableData]);

  return (
    <TransactionContext.Provider
      value={{
        activePage,
        setActiveTable: setActivePage,
        tableData,
        fetchTableData,
        fetchAllData,
        loading,
        error,
        viewMode,
        setViewMode,
        filters,
        setFilters,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactionsContext() {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error(
      "useTransactionsContext must be used within a TableProvider"
    );
  }
  return context;
}
