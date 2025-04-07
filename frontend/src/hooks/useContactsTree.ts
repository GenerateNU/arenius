import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { useDateRange } from "@/context/DateRangeContext";
import { fetchContactEmissions } from "@/services/dashboard";
import { GetContactEmissionsRequest, ContactEmissions } from "@/types";

export default function useContactsTree() {
  const [treeMapData, setTreeMapData] = useState<{ x: string; y: number }[]>(
    []
  );
  const { user, isLoading } = useAuth();
  const { dateRange } = useDateRange();

  const fetchData = useCallback(async () => {
    if (isLoading) {
      console.log("Authentication is still in progress. Please wait...");
      return;
    }

    if (!user) {
      console.log("Company ID is not available yet");
      return;
    }

    try {
      let req = { company_id: user.company_id } as GetContactEmissionsRequest;
      if (dateRange?.from) {
        req = { ...req, start_date: dateRange.from };
      }
      if (dateRange?.to) {
        req = { ...req, end_date: dateRange.to };
      }

      const contactEmissionsData: ContactEmissions[] =
        await fetchContactEmissions(req);

      // Compute total emissions
      const totalCarbon = contactEmissionsData.reduce(
        (sum, contact) => sum + contact.carbon,
        0
      );

      // Convert to percentage and format for treemap
      const formattedData = contactEmissionsData.map((contact) => ({
        x: contact.contact_name,
        y:
          totalCarbon > 0
            ? Math.round((contact.carbon / totalCarbon) * 100)
            : 0,
      }));

      setTreeMapData(formattedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [user, dateRange, isLoading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { treeMapData };
}
