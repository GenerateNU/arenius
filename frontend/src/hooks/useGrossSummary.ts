import { useAuth } from "@/context/AuthContext";
import { useMonthDuration } from "@/context/MonthDurationContext";
import { fetchGrossEmissions } from "@/services/grossEmissions";
import { GrossSummary, GetGrossEmissionsRequest } from "@/types";
import { useCallback, useEffect, useState } from "react";

export default function useGrossSummary() {
    const [grossSummary, setGrossSummary] = useState<GrossSummary>({} as GrossSummary);
    const [req, setReq] = useState<GetGrossEmissionsRequest>({} as GetGrossEmissionsRequest);
    const { companyId, isLoading } = useAuth();
    const { monthDuration, setMonthDuration } = useMonthDuration();

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
        setReq(prev => ({ ...prev, company_id: companyId}))
        setMonthDuration(monthDuration)
        // TODO: add a dropdown to change the month_duration somehow
        const grossSummaryData = await fetchGrossEmissions({...req, company_id: companyId, month_duration: monthDuration});
        setGrossSummary(grossSummaryData);
        console.log("Fetched data:", grossSummaryData); 
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }, [companyId, monthDuration]);
  
    useEffect(() => {
      fetchData();
    }, [fetchData]);    

    return { grossSummary };
}