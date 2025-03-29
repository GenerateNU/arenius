import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { useDateRange } from "@/context/DateRangeContext";
import { fetchNetEmissions } from "@/services/dashboard";
import { GetGrossEmissionsRequest, NetSummary } from "@/types";

export default function useNetSummary() {
  const [netSummary, setNetSummary] = useState<NetSummary>({} as NetSummary);
  const { companyId, isLoading } = useAuth();
  const { dateRange } = useDateRange();

  const fetchData = useCallback(async () => {
    if (isLoading) {
      console.log("Authentication is still in progress. Please wait...");
      return;
    }

    if (!companyId) {
      console.log("Company ID is not available yet");
      return;
    }

    try {
      let req = { company_id: companyId } as GetGrossEmissionsRequest;
      if (dateRange?.from) {
        req = { ...req, start_date: dateRange?.from };
      }

      if (dateRange?.to) {
        req = { ...req, end_date: dateRange?.to };
      }

      const grossSummaryData = await fetchNetEmissions(req);
      setNetSummary(grossSummaryData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [companyId, dateRange, isLoading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { netSummary };
}
