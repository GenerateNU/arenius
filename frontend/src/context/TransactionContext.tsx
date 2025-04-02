import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { fetchLineItems } from "@/services/lineItems";
import { GetLineItemResponse, LineItemFilters } from "@/types";
import { useAuth } from "./AuthContext";

type TABLES = ["reconciled", "unreconciled", "recommended", "offsets"];
export type TableKey = TABLES[number];

type SCOPES = ["scope1", "scope2", "scope3"];
export type ScopeKey = SCOPES[number];

type ViewMode = "paginated" | "scoped";

interface TableContextType {
  activePage: TableKey;
  setActiveTable: (table: TableKey) => void;
  tableData: Record<TableKey | ScopeKey, GetLineItemResponse>;
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
    Record<TableKey | ScopeKey, GetLineItemResponse>
  >({
    reconciled: { count: 0, total: 0, line_items: [] },
    scope1: { count: 0, total: 0, line_items: [] },
    scope2: { count: 0, total: 0, line_items: [] },
    scope3: { count: 0, total: 0, line_items: [] },
    unreconciled: { count: 0, total: 0, line_items: [] },
    recommended: { count: 0, total: 0, line_items: [] },
    offsets: { count: 0, total: 0, line_items: [] },
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
      const [
        reconciled,
        unreconciled,
        recommended,
        offsets,
        scope1,
        scope2,
        scope3,
      ] = await Promise.all([
        fetchLineItems({
          reconciliationStatus: "reconciled",
          ...filters,
          company_id: companyId,
        }),
        fetchLineItems({
          reconciliationStatus: "unreconciled",
          ...filters,
          company_id: companyId,
        }),
        fetchLineItems({
          reconciliationStatus: "recommended",
          ...filters,
          company_id: companyId,
        }),
        // TODO: update this to fetch offsets once endpoint is built
        fetchLineItems({
          reconciliationStatus: "reconciled",
          ...filters,
          company_id: companyId,
        }),
        fetchLineItems({
          scope: 0,
          ...filters,
          company_id: companyId,
        }),
        fetchLineItems({
          scope: 1,
          ...filters,
          company_id: companyId,
        }),
        fetchLineItems({
          scope: 2,
          ...filters,
          company_id: companyId,
        }),
        fetchLineItems({
          scope: 3,
          ...filters,
          company_id: companyId,
        }),
      ]);

      setTableData({
        reconciled,
        unreconciled,
        recommended,
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
      if (table == "offsets") return;

      setLoading(true);
      setError(null);

      try {
        const data = await fetchLineItems({
          reconciliationStatus: table,
          ...filters,
          company_id: companyId,
        });
        setTableData((prev) => ({ ...prev, [table]: data }));
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

  // Fetch data for the active table when relevant dependencies change
  useEffect(() => {
    if (companyId) {
      fetchTableData(activePage);
    }
  }, [companyId, activePage, filters, fetchTableData, fetchAllData]);

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
