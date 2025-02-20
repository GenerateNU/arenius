"use client"

import { EmissionsFactor } from "@/types";
import EmissionsFactorSelector from "./CategorySelector";
import { useEffect, useState } from "react";
import { useLineItems } from "@/context/LineItemsContext";

export default function EmissionsFactorFilter() {
  const [emissionsFactor, setEmissionsFactor] = useState<EmissionsFactor>();
  const { filters, setFilters } = useLineItems();
  
  // Update filter whenever emissionsFactor changes
  useEffect(() => {
    if (emissionsFactor) {
      setFilters({ ...filters, emissionFactor: emissionsFactor.activity_id });
    }
  }, [emissionsFactor]); // Runs whenever emissionsFactor updates

  return (
    <div>
      <EmissionsFactorSelector
                  emissionsFactor={emissionsFactor}
                  setEmissionsFactor={setEmissionsFactor}
                />
    </div>
  );
}