"use client"

import { EmissionsFactor } from "@/types";
import EmissionsFactorSelector from "./CategorySelector";
import { useEffect, useState } from "react";
import { useLineItems } from "@/context/LineItemsContext";
import { cn } from "@/lib/utils";

export default function EmissionsFactorFilter({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const [emissionsFactor, setEmissionsFactor] = useState<EmissionsFactor>();
  const { filters, setFilters } = useLineItems();
  
  // Update filter whenever emissionsFactor changes
  useEffect(() => {
    if (emissionsFactor) {
      setFilters({ ...filters, emissionFactor: emissionsFactor.activity_id });
    }
  }, [emissionsFactor]); // Runs whenever emissionsFactor updates

  return (
    <div className={cn("grid gap-2", className)}>
      <EmissionsFactorSelector
                  emissionsFactor={emissionsFactor}
                  setEmissionsFactor={setEmissionsFactor}
                />
    </div>
  );
}