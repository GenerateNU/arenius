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
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchScopeBreakdown(
        user.company_id,
        startDate.toISOString(),
        endDate.toISOString()
      )
        .then(setData)
        .catch((err) => setError(err.message));
    }
  }, [startDate, endDate, user]);

  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>Loading...</div>;

  const totalEmissions = data.reduce((acc, cur) => acc + cur.total_co2, 0);

  const chartData = data.map((item) => ({
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

  const chartConfig = {
    visitors: {
      label: "CO2e Emissions",
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
                  style={{ backgroundColor: item.fill }}
                />
                <p
                  className={styles.legend.percentage}
                >{`${item.percentage}%`}</p>
                <div className={styles.legend.label}>
                  {`${item.name} - ${formatNumber(item.value)} kg CO2e`}
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

const styles = {
  colors: {
    scope1: "#A1F4A4",
    scope2: "#05C569",
    scope3: "#156641",
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
