import { createContext, useContext, useEffect, useState } from "react";
import { fetchEmissionsFactors } from "@/services/emissionsFactors";
import { EmissionsFactorCategory } from "@/types";

const EmissionsContext = createContext<EmissionsFactorCategory[]>([]);

export function EmissionsProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<EmissionsFactorCategory[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      const response = await fetchEmissionsFactors();
      setCategories(response.sort((a, b) => a.name.localeCompare(b.name)));
    }
    fetchCategories();
  }, []);

  return (
    <EmissionsContext.Provider value={categories}>{children}</EmissionsContext.Provider>
  );
}

export function useEmissions() {
  return useContext(EmissionsContext);
}
