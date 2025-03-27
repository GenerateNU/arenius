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

type TABLES = ["reconciled", "unreconciled", "offsets"];
type TableKey = TABLES[number];

type SCOPES = ["scope1", "scope2", "scope3"];
type ScopeKey = SCOPES[number];

type ViewMode = "paginated" | "scoped";

interface TableContextType {
  activePage: TableKey;
  setActiveTable: (table: TableKey) => void;
  tableData: Record<TableKey | ScopeKey, GetLineItemResponse>;
  pageIndex: Record<TableKey, number>;
  pageSize: Record<TableKey, number>;
  setPage: (table: TableKey, page: number) => void;
  fetchTableData: (table: TableKey, filters: LineItemFilters) => Promise<void>;
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

const TableContext = createContext<TableContextType | undefined>(undefined);

export function TransactionsProvider({ children }: { children: ReactNode }) {
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
    offsets: { count: 0, total: 0, line_items: [] },
  });

  const [page, setPage] = useState<Record<TableKey, number>>({
    reconciled: 1,
    unreconciled: 1,
    offsets: 1,
  });

  const [pageLimit] = useState<Record<TableKey, number>>({
    reconciled: 10,
    unreconciled: 10,
    offsets: 10,
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
      const [reconciled, unreconciled, offsets, scope1, scope2, scope3] =
        await Promise.all([
          fetchLineItems({
            reconciled: true,
            ...filters,
            company_id: companyId,
          }),
          fetchLineItems({
            reconciled: false,
            ...filters,
            company_id: companyId,
          }),
          // TODO: update this to fetch offsets once endpoint is built
          fetchLineItems({
            reconciled: true,
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
    async (table: TableKey, otherFilters: LineItemFilters) => {
      if (!companyId) return;

      setLoading(true);
      setError(null);

      try {
        const data = await fetchLineItems({
          reconciled: table === "reconciled",
          // offsets: table === "offsets",
          ...filters,
          ...otherFilters,
          company_id: companyId,
          pageIndex: page[table],
          pageSize: pageLimit[table],
        });

        setTableData((prev) => ({ ...prev, [table]: data }));
      } catch (err) {
        setError(`Failed to load data: ${err}`);
      }

      setLoading(false);
    },
    [companyId, filters, page, pageLimit]
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
      fetchTableData(activePage, {});
    }
  }, [
    companyId,
    // activePage,
    filters,
    page[activePage],
    pageLimit[activePage],
    fetchTableData,
  ]);

  return (
    <TableContext.Provider
      value={{
        activePage,
        setActiveTable: setActivePage,
        tableData,
        pageIndex: page,
        pageSize: pageLimit,
        setPage: (table: TableKey, pageNumber: number) =>
          setPage((prev) => ({ ...prev, [table]: pageNumber })),
        fetchTableData,
        loading,
        error,
        viewMode,
        setViewMode,
        filters,
        setFilters,
      }}
    >
      {children}
    </TableContext.Provider>
  );
}

export function useTransactionsContext() {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error("useTableContext must be used within a TableProvider");
  }
  return context;
}
