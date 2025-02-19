"use client"
import React, { useState } from "react";
import { DatePickerWithRange } from "./DatePicker";
import EmissionsFactorSelector from "./CategorySelector";
import { EmissionsFactor } from "@/types";
import PriceFilter from "./PriceFilter";


export default function LineItemTableFilters() {
  const [emissionsFactor, setEmissionsFactor] = useState<EmissionsFactor>();
  const handlePriceFilter = ({ min, max }: { min: string; max: string }) => {
    console.log("Filtering prices from:", min, "to", max)
    // Add logic to update the query params or API call here
  }

  return (
    <div className={styles.container}>
      <DatePickerWithRange />
      <EmissionsFactorSelector
              emissionsFactor={emissionsFactor}
              setEmissionsFactor={setEmissionsFactor}
            />
      <PriceFilter onApply={handlePriceFilter} />
    </div>
  );
}

const styles = {
  container: "flex gap-4 my-4",
};
