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

const SCOPES = ["scope1", "scope2", "scope3"] as const;
export type ScopeKey = (typeof SCOPES)[number];

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

  function fetchFilteredLineItems(reconciliationStatus: TableKey) {
    return fetchLineItems({
      ...filters,
      reconciliationStatus,
      company_id: companyId,
    });
  }

  // Fetch all data for all tables and scopes
  const fetchAllData = useCallback(async () => {
    if (!companyId) return;

    setLoading(true);
    setError(null);

    try {
      const [reconciled, unreconciled, recommended, offsets] =
        await Promise.all(TABLES.map((table) => fetchFilteredLineItems(table)));

      const { scope1, scope2, scope3 } = filterByScope(reconciled);

      setTableData({
        reconciled: reconciled.line_items,
        unreconciled: unreconciled.line_items,
        recommended: recommended.line_items,
        offsets: offsets.line_items,
        scope1,
        scope2,
        scope3,
      });
    } catch (err) {
      setError(`Failed to load data: ${err}`);
    }

    setLoading(false);
  }, [companyId]);

  // Fetch data for the active table only
  const fetchTableData = useCallback(
    async (table: TableKey) => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchFilteredLineItems(table);

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

      setLoading(false);
    },
    [companyId, filters]
  );

  // Fetch all data on mount when companyId becomes available
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
  }, [companyId, filters]);

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
