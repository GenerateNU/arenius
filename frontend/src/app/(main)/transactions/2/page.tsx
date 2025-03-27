"use client";

import ReconciledView from "@/components/transactions/ReconciledView";
import UnreconciledView from "@/components/transactions/UnreconciledView";
import { ContactsProvider } from "@/context/ContactsContext";
import { fetchContacts } from "@/services/contacts";
import { LineItemsProvider } from "@/context/LineItemsContext";
import { fetchLineItems } from "@/services/lineItems";
import { TableProvider, useTableContext } from "@/context/TableContext";
import Image from "next/image";

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
    tableData,
    error,
  } = useTableContext();

  return (
    <div className="mt-24 min-h-200px flex-1">
      {/* Table Selection */}
      <div className="flex justify-between">
        <div>
          {["reconciled", "unreconciled", "offsets"].map((page) => (
            <button
              key={page}
              onClick={() =>
                setActiveTable(
                  page as "reconciled" | "unreconciled" | "offsets"
                )
              }
              className={`rounded-md mx-8 px-4 bg-gray-100 ${
                activePage === page
                  ? "bg-green-500 text-white"
                  : "text-gray-700"
              }`}
            >
              {page.toUpperCase()}
            </button>
          ))}
        </div>
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
            className={`${viewMode === "scoped" ? "bg-white" : "bg-gray-300"}`}
            src="/hamburger.svg"
            height={25}
            width={25}
            alt="View all"
            onClick={() => setViewMode("paginated")}
          />
        </div>
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
