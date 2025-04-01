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
    color: "rgb(204,238,186)",
  },
  scope2: {
    label: "Scope 2",
    color: "rgb(112,158,92)",
  },
  scope3: {
    label: "Scope 3",
    color: "rgb(40,59,24)",
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
        <div className="flex justify-between font-[Arimo]">
          <div>
            <CardTitle className="text-black text-4xl mb-2 font-semibold">
              Gross Emissions
            </CardTitle>
            <CardDescription className="text-black text-4xl font-semibold font-[Arimo]">
              {grossSummary.total_co2?.toLocaleString("en-US") || 0} kg
            </CardDescription>
            <CardDescription className="font-[Montserrat] py-2">
              Total emissions (kg) for{" "}
              <span className="font-bold">
                {formattedStartMonth} {formattedStartYear} – {formattedEndMonth}{" "}
                {formattedEndYear}
              </span>
            </CardDescription>
          </div>
          <CustomLegend />
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart accessibilityLayer data={chartData}>
              <defs>
                <linearGradient id="scope1Gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D0F5BC" stopOpacity={1} />
                  <stop offset="100%" stopColor="#C3DCB5" stopOpacity={1} />
                </linearGradient>
                <linearGradient id="scope2Gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ACC99B" stopOpacity={1} />
                  <stop offset="100%" stopColor="#276E0B" stopOpacity={1} />
                </linearGradient>
                <linearGradient id="scope3Gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#426227" stopOpacity={1} />
                  <stop offset="100%" stopColor="#0A0F06" stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="4 4" />
              <XAxis
                dataKey="month"
                tickLine={true}
                tickMargin={10}
                axisLine={false}
                fontFamily="Montserrat"
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis axisLine={false} fontFamily="Montserrat" />
              <ChartTooltip
                content={<ChartTooltipContent hideLabel />}
                wrapperStyle={{ width: "12%" }}
              />
              <Bar
                dataKey="scope3"
                stackId="a"
                fill="url(#scope3Gradient)"
                radius={12}
              />
              <Bar
                dataKey="scope2"
                stackId="a"
                fill="url(#scope2Gradient)"
                radius={12}
              />
              <Bar
                dataKey="scope1"
                stackId="a"
                fill="url(#scope1Gradient)"
                radius={12}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const CustomLegend = () => {
  return (
    <div className="flex flex-col gap-2 mt-4">
      {Object.entries(chartConfig).map(([key, { label, color }]) => (
        <div key={key} className="flex items-center gap-2">
          <span
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-md text-muted-foreground font-[Montserrat]">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
};
