import { createContext, useContext, useEffect, useState } from "react";
import { fetchEmissionsFactors } from "@/services/emissionsFactors";
import { EmissionsFactorCategory } from "@/types";
import { useAuth } from "./AuthContext";

const EmissionsContext = createContext<EmissionsFactorCategory[]>([]);

export function EmissionsProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<EmissionsFactorCategory[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchCategories() {
      const response = await fetchEmissionsFactors("", user?.company_id);
      if (Array.isArray(response)) {
        setCategories(response.sort((a, b) => a.name.localeCompare(b.name)));
      }
    }

    fetchCategories();
  }, [user]);

  return (
    <EmissionsContext.Provider value={categories}>
      {children}
    </EmissionsContext.Provider>
  );
}

export function useEmissions() {
  return useContext(EmissionsContext);
}
