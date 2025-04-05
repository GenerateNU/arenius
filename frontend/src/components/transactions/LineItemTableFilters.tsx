"use client";
import React from "react";

import { useTransactionsContext } from "@/context/TransactionContext";
import ContactFilter from "./ContactFilter";
import { DatePickerWithRange } from "./DatePicker";
import PriceFilter from "./PriceFilter";
import { Button } from "../ui/button";

export default function LineItemTableFilters() {
  const { filters, setFilters } = useTransactionsContext();

  const hasFilter =
    filters.contact_id || filters.minPrice || filters.maxPrice || filters.dates;

  return (
    <div className="flex gap-4">
      <ContactFilter className={styles.filter} />
      <PriceFilter className={styles.filter} />
      <DatePickerWithRange className={styles.filter} />

      {/* <div className="flex justify-end">
        {hasFilter && (
          <Button variant="ghost" onClick={() => setFilters({})}>
            Clear filters
          </Button>
        )}
      </div> */}
    </div>
  );
}

const styles = {
  container: "flex px-4 rounded-lg w-full",
  filter: "flex-1 bg-white rounded-lg shadow-md px-4",
};
