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
import { formatNumber } from "@/lib/utils";
import { useState, useEffect } from "react";
import { fetchTopEmissions } from "@/services/dashboard";

interface TopEmissionFactor {
  rank: number;
  emission_factor: string;
  total_co2: number;
}

export default function TopEmissionsFactors() {
  const { dateRange, formattedDateRange } = useDateRange();
  const [emissions, setEmissions] = useState<TopEmissionFactor[]>([]);
  const { jwt, companyId, isLoading } = useAuth();

  useEffect(() => {
    if (!companyId || !jwt) {
      console.log("Company ID or JWT is not available.");
      return;
    }

    const fetchEmissions = async () => {
      const params = {
        company_id: companyId,
        start_date: dateRange?.from,
        end_date: dateRange?.to,
      };

      const response = await fetchTopEmissions(params, jwt);
      setEmissions(response);
    };

    fetchEmissions();
  }, [dateRange, jwt, companyId, isLoading]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="w-full px-6">
      <CardHeader className="px-0 pb-6">
        <CardTitle className="font-header text-4xl">
          Top Emissions Factors
        </CardTitle>
        <CardDescription className="font-body py-2">
          Total emissions (kg) for{" "}
          <span className="font-bold">{formattedDateRange}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <div className="space-y-2 font-body">
          {emissions &&
            emissions.map((factor, index) => (
              <div
                key={factor.rank}
                className={`flex justify-between items-center p-4 rounded-lg ${
                  index % 2 === 0 ? "bg-green-50" : "bg-white"
                }`}
              >
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-gray-800 pr-4">
                    {factor.rank}
                  </span>
                  <span className="text-md text-gray-700 text-wrap">
                    {factor.emission_factor}
                  </span>
                </div>
                <div className="text-lg font-medium w-1/4 text-right">
                  {formatNumber(factor.total_co2)} kg
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
