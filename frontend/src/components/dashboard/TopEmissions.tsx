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
      <CardContent className="px-0 py-4 lg:py-8 flex-grow">
        <div className="grid grid-rows-5 gap-2 h-full">
          {emissions && emissions.length > 0
            ? emissions.map((factor, index) => (
                <div
                  key={factor.rank}
                  className={`flex justify-between items-center px-4 py-3 rounded-lg ${
                    index % 2 === 0 ? "bg-green-50" : "bg-white"
                  }`}
                >
                  <div className="flex items-start w-3/4">
                    <span className="text-2xl font-bold text-gray-800 pr-6 pt-0.5">
                      {factor.rank}
                    </span>
                    <span className="text-md text-gray-700 break-words pr-2">
                      {factor.emission_factor}
                    </span>
                  </div>
                  <div className="text-lg lg:text-md font-medium w-1/4 text-right whitespace-nowrap">
                    {formatNumber(factor.total_co2)} kg
                  </div>
                </div>
              ))
            : [1, 2, 3, 4, 5].map((index) => (
                <div
                  key={"skeleton" + index}
                  className={`flex justify-between items-center px-4 py-3 rounded-lg ${
                    index % 2 === 0 ? "bg-green-50" : "bg-white"
                  }`}
                >
                  <div className="flex items-center w-3/4">
                    <div className="pr-6">
                      <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="w-full">
                      <div className="h-5 w-full max-w-xs bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="h-5 w-20 ml-auto bg-gray-200 rounded animate-pulse w-1/4 justify-end"></div>
                </div>
              ))}
        </div>
      </CardContent>
    </Card>
  );
}
