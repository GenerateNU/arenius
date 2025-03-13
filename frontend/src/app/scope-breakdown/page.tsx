"use client"
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer, ChartConfig
} from "@/components/ui/chart";
import ScopeChart from "@/components/scope-breakdown/piechart"

type NetSummary = {
  total_co2: number;
  scopes: number;
};

const fetchNetSummary = async (
  companyId: string,
  startDate: string,
  endDate: string
): Promise<NetSummary[]> => {
  const url = `http://localhost:8080/summary/net?company_id=${companyId}&start_date=${startDate}&end_date=${endDate}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch net summary");
  }

  return response.json();
};


export default function ScopeBreakdown() {
  const [data, setData] = useState<NetSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
 
  useEffect(() => {
    const companyId = "1e100087-8182-4ed4-9da7-ae5417a43486";
    const startDate = "2024-08-01T00:00:00Z";
    const endDate = "2025-03-10T00:00:00Z";

    fetchNetSummary(companyId, startDate, endDate)
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>Loading...</div>;

  const totalEmissions = data.reduce((acc, cur) => acc + cur.total_co2, 0);

  const chartData = data.map((item) => ({
    name: `Scope ${item.scopes} Emissions`,
    value: item.total_co2,
    percentage: ((item.total_co2 / totalEmissions) * 100).toFixed(2),
    fill:
      item.scopes === 1
        ? "#A1F4A4"
        : item.scopes === 2
        ? "#05C569"
        : "#156641",
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
    <div className="flex flex-col items-center justify-center h-screen w-full">
      <Card className="flex flex-col items-center justify-center w-full max-w-screen-lg">
        <CardHeader className="items-center pb-0 text-2xl">
          <CardTitle>Scope Breakdown</CardTitle>
          <CardDescription>August 2024 - March 2025</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center w-full p-6 space-x-6">
          <ChartContainer
            className="flex justify-center items-center w-[300px] h-[300px] max-w-full"
            config={chartConfig}
          >
          <ScopeChart chartData={chartData}/>
          </ChartContainer>
          <div className="flex flex-col justify-center space-y-4">
            {chartData.map((item, index) => (
              <div
                key={index}
                className="flex items-center space-x-4"
              >
                <div
                  className={`p-2 font-normal"}`}
                >
                  {`${item.percentage}%`}
                </div>
                <div
                  className={`bg-[#F6F6F6] rounded-lg p-2 font-normal"}`}
                >
                  {`${item.name} - ${item.value.toLocaleString()} kg CO2`}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
