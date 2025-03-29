"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
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
  ChartLegend,
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
  netEmissions: {
    label: "Net emissions",
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
          <stop offset="0%" stopColor="#5F8D39" stopOpacity={1}/>
          <stop offset="100%" stopColor="#2B3E1B" stopOpacity={1}/>
        </linearGradient>
      </defs>

      <rect
        rx={12}
        ry={12}
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
      netEmissions: (month.emissions || 0) - (month.offsets || 0),
      netEmissionsLine: (month.emissions || 0) - (month.offsets || 0),
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
            <ComposedChart data={chartData}>
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
              <ChartLegend
                payload={[
                  {
                    value: chartConfig.netEmissions.label,
                    color: "black",
                    type: "line",
                  },
                  {
                    value: chartConfig.offsets.label,
                    color: "#C7CFCD",
                    type: "rect",
                  },
                ]}
              />
              {/* Bar Graph */}
              <Bar
                dataKey="netEmissions"
                stackId="a"
                shape={<BarGradient />}
                activeBar={<BarGradient />}
                fill="#77B257"
              />
              <Bar
                dataKey="offsets"
                stackId="a"
                fill="#C7CFCD"
                radius={12}
              />

              {/* Line Graph */}
              <Line
                type="monotone"
                dataKey="netEmissionsLine"
                stroke="black"
                strokeWidth={5}
                dot={{ r: 2 }}
                legendType="none"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
