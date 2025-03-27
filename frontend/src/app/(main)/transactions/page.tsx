"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Search } from "lucide-react";
import {
  TransactionsProvider,
  useTransactionsContext,
} from "@/context/TableContext";
import { ContactsProvider } from "@/context/ContactsContext";
import { fetchContacts } from "@/services/contacts";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import ReconciledView from "@/components/transactions/ReconciledView";
import UnreconciledView from "@/components/transactions/UnreconciledView";
import ManualEntryModal from "@/components/transactions/ManualEntryModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { capitalizeFirstLetter } from "@/lib/utils";

export default function Transactions() {
  return (
    <ContactsProvider fetchFunction={fetchContacts}>
      <TransactionsProvider>
        <TableContent />
      </TransactionsProvider>
    </ContactsProvider>
  );
}

function TableContent() {
  const {
    activePage,
    setActiveTable,
    viewMode,
    setViewMode,
    filters,
    setFilters,
    error,
  } = useTransactionsContext();

  const { searchTerm, setSearchTerm, debouncedTerm } = useDebouncedSearch(
    filters.searchTerm ?? ""
  );

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
      <div className={styles.header}>
        <p className={styles.formTitle}>Transactions</p>
        <div className={styles.searchContainer}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} />
            <Input
              placeholder="Search your transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.input}
            />
          </div>
          <ManualEntryModal />
        </div>
      </div>

      {/* Table Selection */}
      <div className="flex justify-between">
        <div className={styles.reconciliationToggle}>
          {["reconciled", "unreconciled", "offsets"].map((page) => (
            <Button
              key={page}
              variant={activePage === page ? "default" : "ghost"}
              onClick={() =>
                setActiveTable(
                  page as "reconciled" | "unreconciled" | "offsets"
                )
              }
              className={styles.button}
            >
              {capitalizeFirstLetter(page)}
            </Button>
          ))}
        </div>
        {activePage == "reconciled" && (
          <div className="flex cursor-pointer">
            <Image
              className={`${
                viewMode === "paginated" ? "bg-white" : "bg-gray-300"
              }`}
              src="/scopedIcon.svg"
              height={25}
              width={25}
              alt="View by scope"
              onClick={() => setViewMode("scoped")}
            />
            <Image
              className={`${
                viewMode === "scoped" ? "bg-white" : "bg-gray-300"
              }`}
              src="/hamburger.svg"
              height={25}
              width={25}
              alt="View all"
              onClick={() => setViewMode("paginated")}
            />
          </div>
        )}
      </div>

      {/* Error & Loading States */}
      {error ? (
        <p>{error}</p>
      ) : (
        <TableRenderer table={activePage} viewMode={viewMode} />
      )}
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
      return <p>Carbon credit table.</p>;
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
