
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useDateRange } from "@/context/DateRangeContext";
import apiClient from "@/services/apiClient";
import { useState, useEffect } from "react";

// The component will use this data structure for emissions factors
interface EmissionFactor {
  rank: number;
  emission_factor: string;
  total_co2: number;
}

export default function TopEmissionsFactors() {
  const { dateRange } = useDateRange();
  const [emissions, setEmissions] = useState<EmissionFactor[]>([]);
  const { jwt, companyId, isLoading } = useAuth();
  console.log("Auth Context: ", { jwt, companyId, isLoading });

  // Get the start and end date from the DateRange context
  const formattedStartMonth =
    new Date(dateRange?.from ?? "").toLocaleDateString("en-US", {
      month: "long",
      timeZone: "UTC",
    }) || "";
  const formattedStartDay =
    new Date(dateRange?.from ?? "").getDate() || "";
  const formattedEndMonth =
    new Date(dateRange?.to ?? "").toLocaleDateString("en-US", {
      month: "long",
      timeZone: "UTC",
    }) || "";
  const formattedEndDay = dateRange?.to
    ? new Date(dateRange.to).getDate()
    : "";
  const formattedEndYear = dateRange?.to
    ? new Date(dateRange.to).getFullYear()
    : "";

  useEffect(() => {
    if (!companyId) {
      console.log("Company ID is not available.");
      return;
    }
    // Fetch the top emissions factors based on the current date range
    const fetchTopEmissions = async () => {
      try {
        const params = {
          company_id: companyId,
          start_date: dateRange?.from,
          end_date: dateRange?.to,
        };
  
        const response = await apiClient.get("/summary/top-emissions", {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
          params,
        });
        
        setEmissions(response.data);
      } catch (error) {
        console.error("Error fetching emissions factors:", error);
      }
    };

    fetchTopEmissions();
  }, [dateRange, jwt, companyId, isLoading]);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return (
    <Card className="w-full max-w-3xl pt-2 mx-auto p-6 rounded-xl shadow-sm border border-gray-100">
      <CardHeader className="px-0 pb-6">
        <CardTitle className="text-3xl font-bold text-gray-800">Top Emissions Factors</CardTitle>
        <CardDescription className="text-gray-500 mt-2 text-lg">
          for {formattedStartDay} {formattedStartMonth} — {formattedEndDay} {formattedEndMonth}, {formattedEndYear}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <div className="space-y-2">
          {emissions.map((factor, index) => (
            <div 
              key={factor.rank} 
              className={`flex justify-between items-center p-4 rounded-lg ${index % 2 === 0 ? 'bg-green-50' : 'bg-white'}`}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-gray-800">{factor.rank}</span>
                <span className="text-l text-gray-700">{factor.emission_factor}</span>
              </div>
              <div className="text-xl font-medium">{factor.total_co2.toFixed(0)} tn</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}