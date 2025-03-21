import { useAuth } from "@/context/AuthContext";
import { useDateRange } from "@/context/DateRangeContext";
import { fetchGrossEmissions } from "@/services/dashboard";
import { GrossSummary, GetGrossEmissionsRequest } from "@/types";
import { useCallback, useEffect, useState } from "react";

export default function useGrossSummary() {
  const [grossSummary, setGrossSummary] = useState<GrossSummary>(
    {} as GrossSummary
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
      let req = { company_id: companyId } as GetGrossEmissionsRequest;
      if (dateRange?.from) {
        req = { ...req, start_date: dateRange?.from };
      }

      if (dateRange?.to) {
        req = { ...req, end_date: dateRange?.to };
      }

      const grossSummaryData = await fetchGrossEmissions(req);
      setGrossSummary(grossSummaryData);
      console.log("Fetched data:", grossSummaryData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [companyId, dateRange, isLoading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { grossSummary };
}