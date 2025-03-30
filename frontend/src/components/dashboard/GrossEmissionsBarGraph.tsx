"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import useGrossSummary from "@/hooks/useGrossSummary";
import { MonthSummary } from "@/types";

const chartConfig = {
  scope1: {
    label: "Scope 1",
    color: "rgba(48,100,68,255)",
  },
  scope2: {
    label: "Scope 2",
    color: "rgba(89,194,114,255)",
  },
  scope3: {
    label: "Scope 3",
    color: "rgba(180,242,171,255)",
  },
} satisfies ChartConfig;

export default function GrossEmissionsBarGraph() {
  const { grossSummary } = useGrossSummary();
  const formattedStartMonth =
    new Date(grossSummary.start_date).toLocaleDateString("en-US", {
      month: "short",
      timeZone: "UTC",
    }) || "";
  const formattedStartYear =
    new Date(grossSummary.start_date).getFullYear() || "";
  const formattedEndMonth =
    new Date(grossSummary.end_date).toLocaleDateString("en-US", {
      month: "short",
      timeZone: "UTC",
    }) || "";
  const formattedEndYear = new Date(grossSummary.end_date).getFullYear() || "";

  const chartData =
    grossSummary.months?.map((month: MonthSummary) => ({
      month: new Date(month.month_start).toLocaleString("en-US", {
        month: "short",
        timeZone: "UTC",
      }),
      scope1: month.scopes.scope_one,
      scope2: month.scopes.scope_two,
      scope3: month.scopes.scope_three,
    })) ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ fontSize: "1.5rem", marginBottom: 8 }}>
          Gross Emissions
        </CardTitle>
        <CardDescription style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
          {grossSummary.total_co2?.toLocaleString("en-US") || 0} kg
        </CardDescription>
        <CardDescription>
          Total emissions (kg) for <span className="font-bold">{formattedStartMonth} {formattedStartYear} -{" "}
          {formattedEndMonth} {formattedEndYear}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart accessibilityLayer data={chartData}>
              <defs>
                <linearGradient id="scope1Gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5F8D39" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#2B3E1B" stopOpacity={1}/>
                </linearGradient>
                <linearGradient id="scope2Gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#94BE7C" stopOpacity={1}/>
                  <stop offset="39%" stopColor="#5C8957" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#36663F" stopOpacity={1}/>
                </linearGradient>
                <linearGradient id="scope3Gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D0F5BC" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#77B257" stopOpacity={1}/>
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={true}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis />
              <ChartTooltip
                content={<ChartTooltipContent hideLabel />}
                wrapperStyle={{ width: "12%" }}
              />
              {/* <ChartLegend content={<ChartLegendContent />} /> */}
              <Bar
                dataKey="scope1"
                stackId="a"
                fill="url(#scope1Gradient)"
                radius={12}
              />
              <Bar
                dataKey="scope2"
                stackId="a"
                fill="url(#scope2Gradient)"
                radius={12}
              />
              <Bar
                dataKey="scope3"
                stackId="a"
                fill="url(#scope3Gradient)"
                radius={12}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
