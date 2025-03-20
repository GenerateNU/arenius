"use client";

import { useEffect } from "react";
import LineItemTable from "@/components/transactions/LineItemTable";
import LineItemTableFilters from "@/components/transactions/LineItemTableFilters";
import { LineItemsProvider, useLineItems } from "@/context/LineItemsContext";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import ManualEntryModal from "@/components/transactions/ManualEntryModal";
import { fetchLineItems } from "@/services/lineItems";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { EmissionsProvider } from "@/context/EmissionsContext";


export default function Transactions() {
  return (
    <LineItemsProvider fetchFunction={fetchLineItems}>
      <TransactionsContent />
    </LineItemsProvider>
  );
}

function TransactionsContent() {
  const { filters, setFilters } = useLineItems();
  const { searchTerm, setSearchTerm, debouncedTerm } = useDebouncedSearch(filters.searchTerm ?? "");

  //const fetchItems = useCallback(() => fetchLineItems(filters), [filters]);

  useEffect(() => {
    console.log("Effect triggered with debouncedTerm:", debouncedTerm);
    console.log("Previous searchTerm:", filters.searchTerm);
    console.log(filters);
    
    if (filters.searchTerm !== debouncedTerm) {
      setFilters({ ...filters, searchTerm: debouncedTerm }); // ✅ Correct way
    }
  }, [debouncedTerm]);

  useEffect(() => {
    if (filters.searchTerm !== debouncedTerm) {
      setFilters({ ...filters, searchTerm: debouncedTerm });
    }
  }, [debouncedTerm]);

  return (
    <EmissionsProvider>
    <div className={styles.container}>
      <div className="flex items-center justify-between mb-4">
        <p className={styles.formTitle}>Transactions</p>
        <div className="flex space-x-8">
          <div className="relative w-80">
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
      <LineItemTableFilters />
      <LineItemTable />
    </div>
    </EmissionsProvider>
  );
}

const styles = {
  container:
    "p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] flex-1",
  formTitle: "font-bold text-xl",
  spacer: "mb-4 border border-black-100",
  searchIcon:
    "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500",
  input:
    "pl-10 py-2 rounded-full bg-gray-100 border-none focus:ring-0 w-full shadow-sm",
};
