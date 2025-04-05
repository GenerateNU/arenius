"use client";

import * as React from "react";
import { DateRange } from "react-day-picker";
import { useTransactionsContext } from "@/context/TransactionContext";
import { DatePicker } from "../dashboard/DatePicker";

export function DatePickerWithRange({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const { filters, setFilters } = useTransactionsContext();
  const dates = filters.dates;

  const handleFilterChange = (e: DateRange | undefined) => {
    setFilters({ ...filters, dates: e });
  };

  return (
    <DatePicker
      dateRange={dates ?? { from: undefined, to: undefined }}
      setDateRange={handleFilterChange}
      className={className}
    />
  );
}
