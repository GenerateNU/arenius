"use client"
import React from "react";
import { DatePickerWithRange } from "./DatePicker";
import PriceFilter from "./PriceFilter";
import EmissionsFactorFilter from "./EmissionsFactorFilter";


export default function LineItemTableFilters() {

  return (
    <div className={styles.container}>
      <DatePickerWithRange />
      <EmissionsFactorFilter />
      <PriceFilter />
    </div>
  );
}

const styles = {
  container: "flex gap-4 my-4",
};
