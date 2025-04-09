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
  const { jwt, user, isLoading } = useAuth();

  useEffect(() => {
    if (!user || !jwt) {
      console.log("Company ID or JWT is not available.");
      return;
    }

    const fetchEmissions = async () => {
      const params = {
        company_id: user.company_id,
        start_date: dateRange?.from,
        end_date: dateRange?.to,
      };

      const response = await fetchTopEmissions(params, jwt);
      setEmissions(response);
    };

    fetchEmissions();
  }, [dateRange, jwt, user, isLoading]);

  return (
    <Card className="px-6 h-full flex flex-col">
      <CardHeader className="px-0 pb-0">
        <CardTitle className="font-header text-4xl">
          Top Emissions Factors
        </CardTitle>
        <CardDescription className="font-body text-sm">
          Total emissions (kg) for{" "}
          <span className="font-bold">{formattedDateRange}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 py-4 lg:py-12 flex-grow flex flex-col justify-between">
        {emissions && emissions.length > 0 ? (
          emissions.map((factor, index) => (
            <div
              key={factor.rank}
              className={`flex justify-between items-center px-4 py-2 rounded-lg ${
                index % 2 === 0 ? "bg-green-50" : "bg-white"
              }`}
            >
              <div className="flex items-center w-2/3">
                <span className="text-2xl font-bold text-gray-800 pr-6">
                  {factor.rank}
                </span>
                <span className="text-md text-gray-700">
                  {factor.emission_factor}
                </span>
              </div>
              <div className="text-lg lg:text-md font-medium w-1/3 text-right">
                {formatNumber(factor.total_co2)} kg
              </div>
            </div>
          ))
        ) : (
          <div className="flex h-32 items-center justify-center">
            <p className="text-gray-500">No emissions data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
