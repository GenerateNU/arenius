"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { LineItemsProvider, useLineItems } from "@/context/LineItemsContext";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { fetchLineItems } from "@/services/lineItems";
import ManualEntryModal from "@/components/transactions/ManualEntryModal";
import ReconciledView from "@/components/transactions/ReconciledView";
import UnreconciledView from "@/components/transactions/UnreconciledView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Transactions() {
  return (
    <LineItemsProvider fetchFunction={fetchLineItems}>
      <TransactionsContent />
    </LineItemsProvider>
  );
}

function TransactionsContent() {
  const [reconciled, setReconciled] = useState(true);
  const { filters, setFilters } = useLineItems();
  const { searchTerm, setSearchTerm, debouncedTerm } = useDebouncedSearch(
    filters.searchTerm
  );

  useEffect(() => {
    setFilters({ ...filters, searchTerm: debouncedTerm });
  }, [debouncedTerm, setFilters]);

  const updateReconciled = (update: boolean) => {
    setReconciled(update);
    setFilters({ ...filters, reconciled: update });
  };

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
      <div className={styles.reconciliationToggle}>
        <Button
          variant={reconciled ? "default" : "ghost"}
          onClick={() => updateReconciled(true)}
          className={styles.button}
        >
          Reconciled
        </Button>
        <Button
          variant={reconciled ? "ghost" : "default"}
          onClick={() => updateReconciled(false)}
          className={styles.button}
        >
          Unreconciled
        </Button>
      </div>
      {reconciled ? <ReconciledView /> : <UnreconciledView />}
    </div>
  );
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
