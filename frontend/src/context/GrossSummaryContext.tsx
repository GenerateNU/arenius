"use client";

import { fetchGrossEmissions } from "@/services/grossEmissions";
import { GrossSummary, GetGrossEmissionsRequest } from "@/types";
import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react";
import { useAuth } from "./AuthContext";

interface GrossSummaryContextValue {
  grossSummary: GrossSummary;
  fetchData: () => void;
  req: GetGrossEmissionsRequest;
  setReq: (req: GetGrossEmissionsRequest) => void;
}

const GrossSummaryContext = createContext<GrossSummaryContextValue | undefined>(
  undefined
);

export const GrossSummaryProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    const [grossSummary, setGrossSummary] = useState<GrossSummary>({} as GrossSummary);
    const [req, setReq] = useState<GetGrossEmissionsRequest>({} as GetGrossEmissionsRequest);
    // const { companyId, isLoading } = useAuth();
    const companyId = "0a67f5d3-88b6-4e8f-aac0-5137b29917fd"
    
    const fetchData = useCallback(async () => {
      // if (isLoading) {
      //   console.log("Authentication is still in progress. Please wait...");
      //   return;
      // }

      if (!companyId) {
        console.log("Company ID is not available yet");
        return;
      }

      try {
        setReq(prev => ({ ...prev, company_id: "0a67f5d3-88b6-4e8f-aac0-5137b29917fd", month_duration: 5})) // TODO: remove hardcode
        // TODO: add a dropdown to change the month_duration somehow
        const grossSummaryData = await fetchGrossEmissions({company_id: "0a67f5d3-88b6-4e8f-aac0-5137b29917fd", month_duration: 5} as GetGrossEmissionsRequest);
        // TODO: fix this using the old state
        setGrossSummary((prevState) => {
          if (JSON.stringify(prevState) !== JSON.stringify(grossSummaryData)) {
            return grossSummaryData;
          }
          return prevState; // No change if data is the same
        });
        console.log("Fetched data:", grossSummaryData); 
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }, []);
  // }, [req, companyId, isLoading]);
  
    useEffect(() => {
      if (companyId) {
        fetchData();
      }
    }, [fetchData]);

    // if (isLoading) {
    //   return <div>Loading...</div>;
    // }
  
    return (
      <GrossSummaryContext.Provider
        value={{ grossSummary, fetchData, req, setReq }}
      >
        {children}
      </GrossSummaryContext.Provider>
    );
  };
  
  export const useGrossSummary = () => {
    const context = useContext(GrossSummaryContext);
    if (!context) {
      throw new Error("useGrossSummary must be used within a DataProvider");
    }
    return context;
  };