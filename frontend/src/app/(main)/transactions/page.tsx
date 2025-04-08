"use client";

import ManualEntryModal from "@/components/transactions/ManualEntryModal";
import OffsetsView from "@/components/transactions/OffsetsView";
import ReconciledView from "@/components/transactions/ReconciledView";
import UnreconciledView from "@/components/transactions/UnreconciledView";
import LineItemTableFilters from "@/components/transactions/LineItemTableFilters";
import ExportTransactionsButton from "@/components/transactions/ExportTransactionsButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ContactProvider } from "@/context/ContactContext";
import {
  ScopeKey,
  TableKey,
  TransactionProvider,
  useTransactionsContext,
} from "@/context/TransactionContext";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { capitalizeFirstLetter } from "@/lib/utils";
import { LineItem } from "@/types";
import { useEffect } from "react";
import { Search } from "lucide-react";
import Image from "next/image";

export default function Transactions() {
  return (
    <TransactionProvider>
      <ContactProvider>
        <TableContent />
        <div className="h-4" />
      </ContactProvider>
    </TransactionProvider>
  );
}

function TableContent() {
  const {
    activePage,
    setActiveTable,
    tableData,
    viewMode,
    setViewMode,
    filters,
    setFilters,
    error,
  } = useTransactionsContext();

  const { searchTerm, setSearchTerm, debouncedTerm } = useDebouncedSearch(
    filters.searchTerm ?? ""
  );

  // Update filters when the debounced search term changes
  useEffect(() => {
    if (filters.searchTerm !== debouncedTerm) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        searchTerm: debouncedTerm,
      }));
    }
  }, [debouncedTerm, setFilters, filters.searchTerm]);

  return (
    <div className={styles.container}>
      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        tableData={tableData}
        activePage={activePage}
        setActiveTable={setActiveTable}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />
      {error ? (
        <p>{error}</p>
      ) : (
        <TableRenderer table={activePage} viewMode={viewMode} />
      )}
    </div>
  );
}

function Header({
  searchTerm,
  setSearchTerm,
  tableData,
  activePage,
  setActiveTable,
  viewMode,
  setViewMode,
}: {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  tableData: Record<TableKey | ScopeKey, LineItem[]>;
  activePage: string;
  setActiveTable: (page: "reconciled" | "unreconciled" | "offsets") => void;
  viewMode: "scoped" | "paginated";
  setViewMode: (mode: "scoped" | "paginated") => void;
}) {
  const { setFilters } = useTransactionsContext();
  return (
    <div>
      <div className={styles.header}>
        <p className={styles.title}>Transactions</p>
        <div className={styles.searchContainer}>
          <ManualEntryModal />
          <ExportTransactionsButton />
        </div>
      </div>

      <TableSelection
        tableData={tableData}
        activePage={activePage}
        setActiveTable={setActiveTable}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />
      <div className="flex justify-between items-center mt-4">
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <div className="flex gap-4">
          <LineItemTableFilters />
          {activePage === "reconciled" && (
            <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
          )}
        </div>
      </div>
      
      <div className="flex justify-end mt-2">
        <Button variant="ghost" onClick={() => setFilters({})}>
          Clear filters
        </Button>
      </div>
    </div>
  );
}

function SearchBar({
  searchTerm,
  setSearchTerm,
}: {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}) {
  return (
    <div className={styles.searchWrapper}>
      <Search className={styles.searchIcon} />
      <Input
        placeholder="Search your transactions..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={styles.input}
      />
    </div>
  );
}

function TableSelection({
  tableData,
  activePage,
  setActiveTable,
}: {
  tableData: Record<TableKey | ScopeKey, LineItem[]>;
  activePage: string;
  setActiveTable: (page: "reconciled" | "unreconciled" | "offsets") => void;
  viewMode: "scoped" | "paginated";
  setViewMode: (mode: "scoped" | "paginated") => void;
}) {
  return (
    <div className={styles.reconciliationToggle}>
      {["reconciled", "unreconciled", "offsets"].map((page) => (
        <Button
          key={page}
          variant={activePage === page ? "outline" : "ghost"}
          onClick={() =>
            setActiveTable(page as "reconciled" | "unreconciled" | "offsets")
          }
          className={styles.button}
        >
          {capitalizeFirstLetter(page)}
          {page === "unreconciled" && (
            <span className="text-xs text-red-500 ml-1">
              {tableData.unreconciled.length}
            </span>
          )}
        </Button>
      ))}
    </div>
  );
}

function ViewModeToggle({
  viewMode,
  setViewMode,
}: {
  viewMode: "scoped" | "paginated";
  setViewMode: (mode: "scoped" | "paginated") => void;
}) {
  return (
    <div className="flex cursor-pointer h-8">
      <Image
        className={`${viewMode === "scoped" && "bg-gray-200 rounded-md"}`}
        src="/scopedIcon.svg"
        height={25}
        width={25}
        alt="View by scope"
        onClick={() => setViewMode("scoped")}
      />
      <Image
        className={`${viewMode === "paginated" && "bg-gray-200 rounded-md"}`}
        src="/hamburger.svg"
        height={25}
        width={25}
        alt="View all"
        onClick={() => setViewMode("paginated")}
      />
    </div>
  );
}

function TableRenderer({
  table,
  viewMode,
}: {
  table: string;
  viewMode: "scoped" | "paginated";
}) {
  switch (table) {
    case "reconciled":
      return <ReconciledView viewMode={viewMode} />;
    case "unreconciled":
      return <UnreconciledView />;
    case "offsets":
      return <OffsetsView />;
    default:
      return <p>No table selected.</p>;
  }
}

const styles = {
  container: "pt-8 pb-20 flex flex-col gap-6 flex-1",
  title: "font-header font-bold text-4xl",
  searchIcon:
    "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500",
  input:
    "pl-10 py-2 rounded-md bg-white border-none focus:ring-0 w-full shadow-md",
  reconciliationToggle: "flex mt-4 bg-gray-100 rounded-lg w-full",
  header: "flex items-center justify-between mb-4",
  searchContainer: "flex space-x-8",
  searchWrapper: "relative w-1/3",
  button: "rounded-md w-full",
};
