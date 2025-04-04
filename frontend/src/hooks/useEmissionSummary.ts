import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { useDateRange } from "@/context/DateRangeContext";
import { fetchEmissions } from "@/services/dashboard";
import { EmissionSummary, GetEmissionsRequest } from "@/types";

export default function useEmissionSummary() {
  const [summary, setSummary] = useState<EmissionSummary>(
    {} as EmissionSummary
  );
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
      let req = { company_id: companyId } as GetEmissionsRequest;
      if (dateRange?.from) {
        req = { ...req, start_date: dateRange?.from };
      }

      if (dateRange?.to) {
        req = { ...req, end_date: dateRange?.to };
      }

      const grossSummaryData = await fetchEmissions(req);
      setSummary(grossSummaryData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [companyId, dateRange, isLoading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { summary };
}
