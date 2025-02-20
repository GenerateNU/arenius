"use client";
import React from "react";
import { DatePickerWithRange } from "./DatePicker";
import PriceFilter from "./PriceFilter";
import EmissionsFactorFilter from "./EmissionsFactorFilter";
import ContactFilter from "./ContactFilter";

export default function LineItemTableFilters() {
  return (
    <div className={styles.container}>
      <DatePickerWithRange className={styles.filter} />
      <EmissionsFactorFilter className={styles.filter} />
      <ContactFilter className={styles.filter} />
      <PriceFilter className={styles.filter} />
    </div>
  );
}

const styles = {
  container: "flex gap-4 my-4 p-4 bg-gray-100 rounded-lg w-full",
  filter: "flex-1 min-w-0 bg-gray-100",
};
