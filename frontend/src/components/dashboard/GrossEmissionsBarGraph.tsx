"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  TooltipProps,
} from "recharts";

import { useDateRange } from "@/context/DateRangeContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import useEmissionSummary from "@/hooks/useEmissionSummary";
import { MonthSummary } from "@/types";
import { formatDate, formatNumber } from "@/lib/utils";

export const chartConfig = {
  scope3: {
    label: "Scope 3",
    color: "#426227",
    gradient: "linear-gradient(to bottom, #426227, #0A0F06)",
  },
  scope2: {
    label: "Scope 2",
    color: "#ACC99B",
    gradient: "linear-gradient(to bottom, #ACC99B, #276E0B)",
  },
  scope1: {
    label: "Scope 1",
    color: "#D0F5BC",
    gradient: "linear-gradient(to bottom, #D0F5BC, #C3DCB5)",
  },
};

export default function GrossEmissionsBarGraph() {
  const { summary, isSummaryLoading } = useEmissionSummary();
  const { formattedDateRange } = useDateRange();
  // const isSummaryLoading = true;
  // Skeleton data for 4 months (Jan to Apr)
  const skeletonData = [
    { month: "Jan", scope1: 0, scope2: 0, scope3: 0 },
    { month: "Feb", scope1: 0, scope2: 0, scope3: 0 },
    { month: "Mar", scope1: 0, scope2: 0, scope3: 0 },
    { month: "Apr", scope1: 0, scope2: 0, scope3: 0 },
  ];

  const chartData = summary?.months?.map((month: MonthSummary) => ({
    month: formatDate(month.month_start, "shortMonth"),
    scope1: month.scopes.scope_one,
    scope2: month.scopes.scope_two,
    scope3: month.scopes.scope_three,
  }));

  const totalEmissions = formatNumber(summary?.gross_co2 || 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between font-[Arimo]">
          <div>
            <CardTitle className="text-black text-4xl mb-2 font-semibold">
              Gross Emissions
            </CardTitle>
            {isSummaryLoading ? (
              <div className="animate-pulse">
                <div className="h-8 w-48 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 w-72 bg-gray-200 rounded"></div>
              </div>
            ) : (
              <>
                <CardDescription className="text-black text-3xl font-semibold font-[Arimo]">
                  {totalEmissions} kg CO₂e
                </CardDescription>
                <CardDescription className="font-[Montserrat] py-2">
                  Total emissions (kg) for{" "}
                  <span className="font-bold">{formattedDateRange}</span>
                </CardDescription>
              </>
            )}
          </div>
          <CustomLegend />
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          {isSummaryLoading ? (
            <Skeleton />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart accessibilityLayer data={chartData || skeletonData}>
                <defs>
                  <linearGradient
                    id="scope1Gradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#D0F5BC" stopOpacity={1} />
                    <stop offset="100%" stopColor="#C3DCB5" stopOpacity={1} />
                  </linearGradient>
                  <linearGradient
                    id="scope2Gradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#ACC99B" stopOpacity={1} />
                    <stop offset="100%" stopColor="#276E0B" stopOpacity={1} />
                  </linearGradient>
                  <linearGradient
                    id="scope3Gradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
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
                <ChartTooltip content={<CustomTooltip />} />
                {Object.keys(chartConfig).map((key) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    stackId="a"
                    fill={`url(#${key}Gradient)`}
                    radius={12}
                    stroke="white"
                    strokeWidth={2}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const CustomLegend = () => {
  return (
    <div className="flex flex-col gap-2 mt-4">
      {Object.entries(chartConfig)
        .reverse()
        .map(([key, { label, gradient }]) => (
          <div key={key} className="flex items-center gap-2">
            <span
              className="w-4 h-4 rounded-full"
              style={{ backgroundImage: gradient }}
            />
            <span className="text-md text-muted-foreground font-[Montserrat]">
              {label}
            </span>
          </div>
        ))}
    </div>
  );
};

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (!active || !payload || payload.length === 0) return null;
  const sortedPayload = [...payload].reverse();
  const total = sortedPayload.reduce((acc, entry) => {
    return acc + (entry?.value || 0);
  }, 0);

  return (
    <div className="bg-white p-3 rounded-lg shadow-md border border-gray-300 font-[Montserrat]">
      <p className="text-md font-semibold">{payload[0]?.payload?.month}</p>
      <div className="mt-2 flex flex-col gap-1">
        {sortedPayload.map((entry, index) => {
          const config = chartConfig[entry.name as keyof typeof chartConfig]; // Get label
          return (
            <div key={index} className="flex items-center gap-2">
              <span
                className="w-4 h-4 rounded-full"
                style={{ backgroundImage: config.gradient }}
              />
              <span className="text-sm text-gray-700 font-medium">
                {config?.label || entry.name}: {formatNumber(entry.value) || 0}{" "}
                kg
              </span>
            </div>
          );
        })}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 font-medium">
            Total: {formatNumber(total)} kg
          </span>
        </div>
      </div>
    </div>
  );
};

const Skeleton = () => {
  return (
    <div className="w-full h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
      <div className="w-full px-6">
        <style>
          {`
            .scope1-gradient { background-image: ${chartConfig.scope1.gradient}; }
            .scope2-gradient { background-image: ${chartConfig.scope2.gradient}; }
            .scope3-gradient { background-image: ${chartConfig.scope3.gradient}; }
                    
            @keyframes shimmer {
              0% { opacity: 0.7; }
              50% { opacity: 0.9; }
              100% { opacity: 0.7; }
            }
            .animate-shimmer {
              animation: shimmer 1.5s infinite;
            }
          `}
        </style>
      </div>
    </div>
  );
};
