"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartConfig } from "@/components/ui/chart";
import ScopeChart from "@/components/scope-breakdown/piechart";
import { useDateRange } from "@/context/DateRangeContext";
import { useAuth } from "@/context/AuthContext";
import { ScopeBreakdown } from "@/types";
import { fetchScopeBreakdown } from "@/services/dashboard";
import { formatNumber } from "@/lib/utils";

const ScopeBreakdownChart = () => {
  const [data, setData] = useState<ScopeBreakdown[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { dateRange, formattedDateRange } = useDateRange();

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const startDate = dateRange?.from || threeMonthsAgo;
  const endDate = dateRange?.to || new Date();
  const { companyId } = useAuth();

  useEffect(() => {
    if (companyId) {
      fetchScopeBreakdown(
        companyId,
        startDate.toISOString(),
        endDate.toISOString()
      )
        .then(setData)
        .catch((err) => setError(err.message));
    }
  }, [startDate, endDate, companyId]);

  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>Loading...</div>;

  const totalEmissions = data.reduce((acc, cur) => acc + cur.total_co2, 0);

  const chartData = data.map((item) => ({
    scope: item.scopes,
    name: `Scope ${item.scopes}`,
    value: item.total_co2,
    percentage: ((item.total_co2 / totalEmissions) * 100).toFixed(2),
    fill:
      item.scopes === 1 ? "#A1F4A4" : item.scopes === 2 ? "#05C569" : "#156641",
  }));

  const chartConfig = {
    visitors: {
      label: "CO2 Emissions",
    },
    ...chartData.reduce((acc, item, index) => {
      acc[`Scope${index}`] = {
        label: item.name,
        color: item.fill,
      };
      return acc;
    }, {} as ChartConfig),
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <Card className="flex flex-col w-full max-w-screen-lg">
        <CardHeader className="pb-0 text-2xl">
          <CardTitle className="font-[Arimo] text-4xl">
            Scope Breakdown
          </CardTitle>
          <CardDescription className="font-[Montserrat] py-2">
            Total emissions (kg) for{" "}
            <span className="font-bold">{formattedDateRange}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center w-full px-6 space-x-6">
          <ChartContainer
            className="flex justify-center items-center w-[300px] h-[300px] max-w-full"
            config={chartConfig}
          >
            <ScopeChart chartData={chartData} />
          </ChartContainer>
          <div className="flex flex-col justify-center space-y-4 font-[Montserrat]">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: item.fill }}
                />
                <p className="text-sm">{`${item.percentage}%`}</p>

                <div className="bg-[#F6F6F6] rounded-lg p-2 text-sm">
                  {`${item.name} - ${formatNumber(item.value)} kg CO2`}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScopeBreakdownChart;
