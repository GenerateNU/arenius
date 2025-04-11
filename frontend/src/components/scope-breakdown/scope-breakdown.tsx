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

interface ChartDataItem {
  scope: number;
  name: string;
  value: number;
  percentage: string;
  fill: string;
}

interface StylesType {
  colors: {
    scope1: string;
    scope2: string;
    scope3: string;
    background: string;
  };
  card: {
    container: string;
    header: string;
    title: string;
    description: string;
    content: string;
    chartContainer: string;
  };
  legend: {
    container: string;
    item: string;
    dot: string;
    percentage: string;
    label: string;
  };
  container: string;
  bold: string;
}

const ScopeBreakdownChart: React.FC = () => {
  const [data, setData] = useState<ScopeBreakdown[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { dateRange, formattedDateRange } = useDateRange();

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const startDate = dateRange?.from || threeMonthsAgo;
  const endDate = dateRange?.to || new Date();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      fetchScopeBreakdown(
        user.company_id,
        startDate.toISOString(),
        endDate.toISOString()
      )
        .then((data) => {
          setData(data);
          setIsLoading(false);
        })
        .catch((err: Error) => {
          setError(err.message);
          setIsLoading(false);
        });
    }
  }, [startDate, endDate, user]);

  if (error) return <div>Error: {error}</div>;

  // Create chart data if we have real data
  let chartData: ChartDataItem[] = [];
  let chartConfig: ChartConfig = { visitors: { label: "CO₂e Emissions" } };
  let totalEmissions = 0;

  if (data) {
    totalEmissions = data.reduce((acc, cur) => acc + cur.total_co2, 0);

    chartData = data.map((item) => ({
      scope: item.scopes,
      name: `Scope ${item.scopes}`,
      value: item.total_co2,
      percentage: ((item.total_co2 / totalEmissions) * 100).toFixed(2),
      fill:
        item.scopes === 1
          ? styles.colors.scope1
          : item.scopes === 2
          ? styles.colors.scope2
          : styles.colors.scope3,
    }));

    chartConfig = {
      visitors: {
        label: "CO₂e Emissions",
      },
      ...chartData.reduce<Record<string, { label: string; color: string }>>(
        (acc, item, index) => {
          acc[`Scope${index}`] = {
            label: item.name,
            color: item.fill,
          };
          return acc;
        },
        {}
      ),
    };
  }

  return (
    <div className={styles.container}>
      <Card className={styles.card.container}>
        <CardHeader className={styles.card.header}>
          <CardTitle className={styles.card.title}>Scope Breakdown</CardTitle>
          <CardDescription className={styles.card.description}>
            Total emissions (kg) for{" "}
            <span className={styles.bold}>{formattedDateRange}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className={styles.card.content}>
          {isLoading ? (
            <div className="flex flex-col md:flex-row justify-center items-center w-full px-6 space-x-0 md:space-x-6 space-y-6 md:space-y-0">
              {/* Chart skeleton */}
              <div className="relative w-[300px] h-[300px] flex items-center justify-center">
                <div className="w-[300px] h-[300px] rounded-full bg-gray-100 animate-pulse"></div>
                {/* Create donut hole */}
                <div className="absolute w-[150px] h-[150px] bg-white rounded-full"></div>
                {/* Placeholder text in center */}
                <div className="absolute flex flex-col items-center justify-center">
                  <div className="w-32 h-6 bg-gray-200 rounded-md animate-pulse mb-1"></div>
                  <div className="w-24 h-4 bg-gray-200 rounded-md animate-pulse"></div>
                </div>
              </div>

              {/* Legend skeleton */}
              <div className="flex flex-col justify-center space-y-4 font-[Montserrat]">
                {[1, 2, 3].map((item, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div
                      className="w-5 h-5 rounded-full animate-pulse"
                      style={{
                        background:
                          index === 0
                            ? styles.colors.scope1
                            : index === 1
                            ? styles.colors.scope2
                            : styles.colors.scope3,
                      }}
                    ></div>
                    <div className="w-16 h-5 bg-gray-200 rounded animate-pulse"></div>
                    <div className="bg-[#F6F6F6] rounded-lg p-2 w-40 h-8 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <ChartContainer
                className={styles.card.chartContainer}
                config={chartConfig}
              >
                <ScopeChart chartData={chartData} />
              </ChartContainer>
              <div className={styles.legend.container}>
                {chartData.map((item, index) => (
                  <div key={index} className={styles.legend.item}>
                    <div
                      className={styles.legend.dot}
                      style={{ backgroundImage: item.fill }}
                    />
                    <p
                      className={styles.legend.percentage}
                    >{`${item.percentage}%`}</p>
                    <div className={styles.legend.label}>
                      {`${item.name} - ${formatNumber(item.value)} kg CO`}
                      <sub>2</sub>e
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScopeBreakdownChart;

const styles: StylesType = {
  colors: {
    scope1: "linear-gradient(to bottom, #D0F5BC, #C3DCB5)",
    scope2: "linear-gradient(to bottom, #ACC99B, #276E0B)",
    scope3: "linear-gradient(to bottom, #426227, #0A0F06)",
    background: "#F6F6F6",
  },
  card: {
    container: "flex flex-col w-full max-w-screen-lg",
    header: "pb-0 text-2xl",
    title: "font-[Arimo] text-4xl",
    description: "font-[Montserrat] py-2",
    content:
      "flex flex-col md:flex-row justify-center items-center w-full px-6 space-x-6",
    chartContainer:
      "flex justify-center items-center w-[300px] h-[300px] max-w-full",
  },
  legend: {
    container: "flex flex-col justify-center space-y-4 font-[Montserrat]",
    item: "flex items-center space-x-4",
    dot: "w-5 h-5 rounded-full",
    percentage: "text-sm",
    label: "bg-[#F6F6F6] rounded-lg p-2 text-sm",
  },
  container: "flex flex-col items-center justify-center",
  bold: "font-bold",
};
