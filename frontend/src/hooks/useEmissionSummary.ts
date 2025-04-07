import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { useDateRange } from "@/context/DateRangeContext";
import { fetchEmissions } from "@/services/dashboard";
import { EmissionSummary, GetEmissionsRequest } from "@/types";

export default function useEmissionSummary() {
  const [summary, setSummary] = useState<EmissionSummary>(
    {} as EmissionSummary
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
      let req = { company_id: user.company_id } as GetEmissionsRequest;
      if (dateRange?.from) {
        req = { ...req, start_date: dateRange?.from };
      }

      if (dateRange?.to) {
        req = { ...req, end_date: dateRange?.to };
      }

      const summaryData = await fetchEmissions(req);
      setSummary(summaryData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [user, dateRange, isLoading]);

  useEffect(() => {
    fetchData();
  }, [fetchData, user]);

  return { summary };
}
