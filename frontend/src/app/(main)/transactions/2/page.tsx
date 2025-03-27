"use client";

import ReconciledView from "@/components/transactions/ReconciledView";
import UnreconciledView from "@/components/transactions/UnreconciledView";
import { ContactsProvider } from "@/context/ContactsContext";
import { fetchContacts } from "@/services/contacts";
import { LineItemsProvider } from "@/context/LineItemsContext";
import { fetchLineItems } from "@/services/lineItems";
import { TableProvider, useTableContext } from "@/context/TableContext";
import Image from "next/image";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import ManualEntryModal from "@/components/transactions/ManualEntryModal";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function TablePage() {
  return (
    <ContactsProvider fetchFunction={fetchContacts}>
      <LineItemsProvider fetchFunction={fetchLineItems}>
        <TableProvider>
          <TableContent />
        </TableProvider>
      </LineItemsProvider>
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
  } = useTableContext();

  const { searchTerm, setSearchTerm, debouncedTerm } = useDebouncedSearch(
    filters.searchTerm ?? ""
  );

  console.log("search term: ", searchTerm);

  useEffect(() => {
    if (filters.searchTerm !== debouncedTerm) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        searchTerm: debouncedTerm,
      }));
    }
  }, [debouncedTerm, setFilters]);

  return (
    <div className="mt-24 min-h-200px flex-1">
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
        <div>
          {["reconciled", "unreconciled", "offsets"].map((page) => (
            <Button
              key={page}
              onClick={() =>
                setActiveTable(
                  page as "reconciled" | "unreconciled" | "offsets"
                )
              }
              className={`rounded-md px-4 py-2 bg-gray-100 ${
                activePage === page
                  ? "bg-green-500 text-white"
                  : "text-gray-700"
              }`}
            >
              {page.toUpperCase()}
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
