"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import useNetSummary from "@/hooks/useNetSummary";
import { MonthNetSummary } from "@/types";
import { BarRectangleItem } from "recharts/types/cartesian/Bar";
import { useId } from "react";

const chartConfig = {
  offsets: {
    label: "Offsets",
    color: "rgba(48,100,68,255)",
  },
  emissions: {
    label: "Emissions",
    color: "rgba(48,100,68,255)",
  },
} satisfies ChartConfig;

function BarGradient(props: BarRectangleItem) {
  const id = useId();
  const gradientId = `gradient-${id}`;

  return (
    <>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="6%" stopColor="#77B257" />
          <stop offset="85%" stopColor="#2B3E1B" />
        </linearGradient>
      </defs>

      <rect
        x={props.x}
        y={props.y}
        width={props.width}
        height={props.height}
        fill={`url(#${gradientId})`}
      />
    </>
  );
}

export default function NetEmissionsBarGraph() {
  const { netSummary } = useNetSummary();
  const formattedStartMonth =
    new Date(netSummary.start_date).toLocaleDateString("en-US", {
      month: "short",
      timeZone: "UTC",
    }) || "";
  const formattedStartYear =
    new Date(netSummary.start_date).getFullYear() || "";
  const formattedEndMonth =
    new Date(netSummary.end_date).toLocaleDateString("en-US", {
      month: "short",
      timeZone: "UTC",
    }) || "";
  const formattedEndYear = new Date(netSummary.end_date).getFullYear() || "";

  const chartData =
    netSummary.months?.map((month: MonthNetSummary) => ({
      month: new Date(month.month_start).toLocaleString("en-US", {
        month: "short",
        timeZone: "UTC",
      }),
      offsets: month.offsets || 0,
      emissions: month.emissions || 0,
    })) ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ fontSize: "1.5rem" }}>Net Emissions</CardTitle>
        <br />
        <CardDescription>
          Net emissions (kg) for {formattedStartMonth} {formattedStartYear} -{" "}
          {formattedEndMonth} {formattedEndYear}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={true}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                content={<ChartTooltipContent hideLabel />}
                wrapperStyle={{ width: "12%" }}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="emissions"
                stackId="a"
                shape={<BarGradient />}
                activeBar={<BarGradient />}
                fill="#77B257"
              />
              <Bar
                dataKey="offsets"
                stackId="a"
                fill="#C7CFCD"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
