import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { fetchLineItems } from "@/services/lineItems";
import { LineItem, LineItemFilters } from "@/types";
import { useAuth } from "./AuthContext";

type TABLES = ["reconciled", "unreconciled", "recommended", "offsets"];
export type TableKey = TABLES[number];

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

  // Fetch all data for all tables and scopes
  const fetchAllData = useCallback(async () => {
    if (!companyId) return;

    setLoading(true);
    setError(null);

    try {
      const [reconciled, unreconciled, recommended] = await Promise.all(
        ["reconciled", "unreconciled", "recommended"].map((status) =>
          fetchLineItems({
            reconciliationStatus: status as TableKey,
            ...filters,
            company_id: companyId,
          })
        )
      );
      const offsets = reconciled.line_items.filter((item) => item.scope === 0);
      const scope1 = reconciled.line_items.filter((item) => item.scope === 1);
      const scope2 = reconciled.line_items.filter((item) => item.scope === 2);
      const scope3 = reconciled.line_items.filter((item) => item.scope === 3);

      setTableData({
        reconciled: reconciled.line_items,
        unreconciled: unreconciled.line_items,
        recommended: recommended.line_items,
        offsets,
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
      if (!companyId) return;
      // TODO: handle offsets properly
      if (table == "offsets") return;

      setLoading(true);
      setError(null);

      try {
        const data = await fetchLineItems({
          reconciliationStatus: table,
          ...filters,
          company_id: companyId,
        });
        setTableData((prev) => ({ ...prev, [table]: data.line_items }));
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
