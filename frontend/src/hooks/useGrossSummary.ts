import { useAuth } from "@/context/AuthContext";
import { useDateRange } from "@/context/DateRangeContext";
import { fetchGrossEmissions } from "@/services/grossEmissions";
import { GrossSummary, GetGrossEmissionsRequest } from "@/types";
import { useCallback, useEffect, useState } from "react";

export default function useGrossSummary() {
    const [grossSummary, setGrossSummary] = useState<GrossSummary>({} as GrossSummary);
    const [req, setReq] = useState<GetGrossEmissionsRequest>({} as GetGrossEmissionsRequest);
    const { companyId, isLoading } = useAuth();
    const { dateRange, setDateRange } = useDateRange();

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
        setDateRange(dateRange)
        
        var start_date = new Date()
        start_date.setMonth(start_date.getMonth() - 3);
        if (dateRange?.from) {
          start_date = dateRange?.from
        }

        var end_date = new Date();
        if (dateRange?.to) {
          end_date = dateRange?.to
        }

        const grossSummaryData = await fetchGrossEmissions({...req, company_id: companyId, start_date: start_date, end_date: end_date});
        setGrossSummary(grossSummaryData);
        console.log("Fetched data:", grossSummaryData); 
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }, [companyId, dateRange, isLoading, setReq, setDateRange]);
  
    useEffect(() => {
      fetchData();
    }, [fetchData]);    

    return { grossSummary };
}