"use client";

import React from "react";
import { DatePickerWithRange } from "./DatePicker";
import PriceFilter from "./PriceFilter";
import ContactFilter from "./ContactFilter";

export default function LineItemTableFilters() {
  return (
    <div className={styles.container}>
      <ContactFilter className={styles.filter} />
      <PriceFilter className={styles.filter} />
      <DatePickerWithRange showClearAndApply={true} />
    </div>
  );
}

const styles = {
  container: "flex gap-2",
  filter: "flex-1 bg-white rounded-lg shadow-md px-4",
};
