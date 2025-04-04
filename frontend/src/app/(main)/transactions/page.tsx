"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Search } from "lucide-react";
import {
  ScopeKey,
  TableKey,
  TransactionProvider,
  useTransactionsContext,
} from "@/context/TransactionContext";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import ReconciledView from "@/components/transactions/ReconciledView";
import UnreconciledView from "@/components/transactions/UnreconciledView";
import ManualEntryModal from "@/components/transactions/ManualEntryModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { capitalizeFirstLetter } from "@/lib/utils";
import { GetLineItemResponse } from "@/types";
import SignOutButton from "@/components/auth/signOut";
import DeleteAccountButton from "@/components/auth/deleteAccount";
import { ContactProvider } from "@/context/ContactContext";
import OffsetsView from "@/components/transactions/OffsetsView";
import ExportTransactionsButton from "@/components/transactions/ExportTransactionsButton";

export default function Transactions() {
  return (
    <TransactionProvider>
      <ContactProvider>
        <TableContent />
        <div className="h-4" />
        <SignOutButton />
        <DeleteAccountButton />
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
  tableData: Record<TableKey | ScopeKey, GetLineItemResponse>;
  activePage: string;
  setActiveTable: (page: "reconciled" | "unreconciled" | "offsets") => void;
  viewMode: "scoped" | "paginated";
  setViewMode: (mode: "scoped" | "paginated") => void;
}) {
  return (
    <div>
      <div className={styles.header}>
        <p className={styles.formTitle}>Transactions</p>
        <div className={styles.searchContainer}>
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
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
  viewMode,
  setViewMode,
}: {
  tableData: Record<TableKey | ScopeKey, GetLineItemResponse>;
  activePage: string;
  setActiveTable: (page: "reconciled" | "unreconciled" | "offsets") => void;
  viewMode: "scoped" | "paginated";
  setViewMode: (mode: "scoped" | "paginated") => void;
}) {
  return (
    <div className="flex justify-between">
      <div className={styles.reconciliationToggle}>
        {["reconciled", "unreconciled", "offsets"].map((page) => (
          <Button
            key={page}
            variant={activePage === page ? "default" : "ghost"}
            onClick={() =>
              setActiveTable(page as "reconciled" | "unreconciled" | "offsets")
            }
            className={styles.button}
          >
            {capitalizeFirstLetter(page)}
            {page === "unreconciled" && (
              <span className="text-xs text-red-500 ml-1">
                {tableData.unreconciled.total}
              </span>
            )}
          </Button>
        ))}
      </div>
      {activePage === "reconciled" && (
        <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
      )}
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
    <div className="flex cursor-pointer">
      <Image
        className={`${viewMode === "paginated" ? "bg-white" : "bg-gray-300"}`}
        src="/scopedIcon.svg"
        height={25}
        width={25}
        alt="View by scope"
        onClick={() => setViewMode("scoped")}
      />
      <Image
        className={`${viewMode === "scoped" ? "bg-white" : "bg-gray-300"}`}
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
  container:
    "p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] flex-1",
  formTitle: "font-bold text-xl",
  searchIcon:
    "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500",
  input:
    "pl-10 py-2 rounded-full bg-gray-100 border-none focus:ring-0 w-full shadow-sm",
  reconciliationToggle: "flex space-x-4",
  header: "flex items-center justify-between mb-4",
  searchContainer: "flex space-x-8",
  searchWrapper: "relative w-80",
  button: "px-4 py-2 rounded-md",
};
