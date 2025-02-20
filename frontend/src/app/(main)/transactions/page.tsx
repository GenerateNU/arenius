"use client";

import LineItemTable from "@/components/transactions/LineItemTable";
import LineItemTableFilters from "@/components/transactions/LineItemTableFilters";
import { LineItemsProvider, useLineItems } from "@/context/LineItemsContext";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import ManualEntryModal from "@/components/transactions/ManualEntryModal";

export default function Transactions() {
  return (
    <LineItemsProvider>
      <TransactionsContent />
    </LineItemsProvider>
  );
}

function TransactionsContent() {
  const { filters, setFilters } = useLineItems();
  const searchTerm = filters.searchTerm || "";

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, searchTerm: e.target.value });
  };

  return (
    <div className={styles.container}>
      {/* <hr className={styles.spacer} /> */}

      {/* Title and Search Bar in One Line */}
      <div className="flex items-center justify-between mb-4">
        <p className={styles.formTitle}>Transactions</p>
        <div className="flex space-x-8">
          <div className="relative w-80">
            <Search className={styles.searchIcon} />
            <Input
              placeholder="Search your transactions..."
              value={searchTerm}
              onChange={handleSearch}
              className={styles.input}
            />
          </div>
          <ManualEntryModal />
        </div>
      </div>

      <LineItemTableFilters />
      <LineItemTable />
    </div>
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
