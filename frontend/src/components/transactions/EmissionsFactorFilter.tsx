"use client";

import { EmissionsFactor } from "@/types";
import EmissionsFactorSelector from "./CategorySelector";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useTableContext } from "@/context/TableContext";

export default function EmissionsFactorFilter({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const [emissionsFactor, setEmissionsFactor] = useState<EmissionsFactor>();
  const { filters, setFilters } = useTableContext();
  const { companyId } = useAuth();

  // Update filter whenever emissionsFactor changes
  useEffect(() => {
    if (emissionsFactor) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        emissionFactor: emissionsFactor.activity_id,
      }));
    }
    if (companyId && filters.company_id !== companyId) {
      setFilters({ ...filters, company_id: companyId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, emissionsFactor]); // Runs whenever emissionsFactor updates

  return (
    <div className={cn("grid gap-2", className)}>
      <EmissionsFactorSelector
        emissionsFactor={emissionsFactor}
        setEmissionsFactor={setEmissionsFactor}
        variant="ghost"
      />
    </div>
  );
}
