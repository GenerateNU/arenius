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
  const { dateRange, formattedDateRange } = useDateRange();
  const [emissions, setEmissions] = useState<EmissionFactor[]>([]);
  const { jwt, companyId, isLoading } = useAuth();

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
    <Card className="w-full max-w-3xl mx-auto px-6 rounded-xl shadow-sm border border-gray-100">
      <CardHeader className="px-0 pb-6">
        <CardTitle className="text-black text-4xl mb-2 font-semibold">
          Top Emissions Factors
        </CardTitle>
        <CardDescription className="font-[Montserrat] py-2">
          Total emissions (kg) for{" "}
          <span className="font-bold">{formattedDateRange}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <div className="space-y-2">
          {emissions &&
            emissions.map((factor, index) => (
              <div
                key={factor.rank}
                className={`flex justify-between items-center p-4 rounded-lg ${
                  index % 2 === 0 ? "bg-green-50" : "bg-white"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-gray-800">
                    {factor.rank}
                  </span>
                  <span className="text-l text-gray-700">
                    {factor.emission_factor}
                  </span>
                </div>
                <div className="text-xl font-medium">
                  {factor.total_co2.toFixed(0)} tn
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
