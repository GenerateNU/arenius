"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  TooltipProps,
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
} from "@/components/ui/chart";
import { MonthSummary } from "@/types";
import { BarRectangleItem } from "recharts/types/cartesian/Bar";
import { useId } from "react";
import useEmissionSummary from "@/hooks/useEmissionSummary";
import { formatDate, formatNumber } from "@/lib/utils";
import { useDateRange } from "@/context/DateRangeContext";

const chartConfig = {
  emissions: {
    label: "Gross emissions",
    color: "#5F8D39",
  },
  offsets: {
    label: "Offsets",
    color: "#C7CFCD",
  },
  netEmissions: {
    label: "Net emissions",
    color: "#2B3E1B",
  },
} satisfies ChartConfig;

function BarGradient(props: BarRectangleItem) {
  const id = useId();
  const gradientId = `gradient-${id}`;
  if (props.height && props.height <= 0) {
    return null; // Don't render the gradient if the height is negative
  }

  return (
    <>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5F8D39" stopOpacity={1} />
          <stop offset="100%" stopColor="#2B3E1B" stopOpacity={1} />
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
  const { summary, isSummaryLoading } = useEmissionSummary();
  const { formattedDateRange } = useDateRange();

  // Generate skeleton data for 4 months (Jan to Apr)
  const skeletonData = [
    { month: "Jan", offsets: 0, emissions: 0, netEmissions: 0 },
    { month: "Feb", offsets: 0, emissions: 0, netEmissions: 0 },
    { month: "Mar", offsets: 0, emissions: 0, netEmissions: 0 },
    { month: "Apr", offsets: 0, emissions: 0, netEmissions: 0 },
  ];

  const chartData =
    summary?.months?.map((month: MonthSummary) => ({
      month: formatDate(month.month_start, "shortMonth"),
      offsets: month.offsets || 0,
      emissions: month.emissions || 0,
      netEmissions: (month.emissions || 0) - (month.offsets || 0),
    })) ?? [];

  const totalEmissions = summary ? formatNumber(summary.net_co2) : "0";

  return (
    <Card>
      <CardHeader className="px-6 pt-6 pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="font-header text-4xl mb-2 font-semibold">
              Net Emissions
            </CardTitle>
            {isSummaryLoading ? (
              <div className="animate-pulse">
                <div className="h-8 w-48 bg-gray-200 rounded"></div>
              </div>
            ) : (
              <CardDescription className="text-black text-3xl font-semibold font-[Arimo]">
                {totalEmissions} kg CO₂e
              </CardDescription>
            )}
          </div>
          <CustomLegend />
        </div>
        {isSummaryLoading ? (
          <div className="animate-pulse mt-2">
            <div className="h-6 w-72 bg-gray-200 rounded"></div>
          </div>
        ) : (
          <CardDescription className="font-[Montserrat] py-2">
            Total emissions (kg) for{" "}
            <span className="font-bold">{formattedDateRange}</span>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          {isSummaryLoading ? (
            <div className="w-full h-[250px] flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="w-full px-6">
                {/* Skeleton chart */}
                <div className="w-full h-[250px] relative">
                  <div className="absolute bottom-8 left-0 right-0 h-[1px] bg-gray-200"></div>
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="absolute h-[1px] bg-gray-200 left-0 right-0"
                      style={{ bottom: `${8 + i * 60}px` }}
                    ></div>
                  ))}
                  {/* Skeleton bars and line */}
                  <div className="absolute bottom-8 left-0 right-0 flex justify-between px-10">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex flex-col justify-end">
                        <div className="mt-2 w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div
                          className="w-16 bg-[#5F8D39] rounded-t-lg animate-pulse"
                          style={{
                            height: `${Math.random() * 100 + 20}px`,
                          }}
                        ></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart
                data={chartData.length > 0 ? chartData : skeletonData}
              >
                <CartesianGrid vertical={false} strokeDasharray="4 4" />
                <XAxis
                  dataKey="month"
                  tickLine={true}
                  tickMargin={10}
                  axisLine={false}
                  fontFamily="Montserrat"
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <YAxis fontFamily="Montserrat" />
                <ChartTooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="netEmissions"
                  stackId="a"
                  shape={<BarGradient />}
                  activeBar={<BarGradient />}
                  fill="#77B257"
                />
                <Bar dataKey="offsets" stackId="a" fill="#C7CFCD" radius={12} />
                <Line
                  type="monotone"
                  dataKey="netEmissions"
                  stroke="black"
                  strokeWidth={5}
                  dot={{ r: 2 }}
                  legendType="none"
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0]?.payload;

  return (
    <div className="bg-white p-3 rounded-lg shadow-md border border-gray-300 font-[Montserrat]">
      <p className="text-md font-semibold">{data?.month}</p>
      <div className="mt-2 flex flex-col gap-1">
        {Object.keys(chartConfig).map((entry) => {
          const config = chartConfig[entry as keyof typeof chartConfig];
          const entryValue = data?.[entry as keyof typeof data];

          return (
            <div key={entry} className="flex items-center gap-2">
              <span
                className={
                  entry === "netEmissions" ? "w-4 h-1" : "w-4 h-4 rounded-full"
                }
                style={{ backgroundColor: config.color || "#C7CFCD" }}
              />
              <span className="text-sm text-gray-700 font-medium">
                {config?.label || entry}: {formatNumber(entryValue) || 0} kg
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CustomLegend = () => {
  return (
    <div className="flex flex-col gap-1">
      {Object.entries(chartConfig).map(([key, { label, color }]) => (
        <div key={key} className="flex items-center gap-2">
          <span
            className={
              key === "netEmissions" ? "w-4 h-1" : "w-4 h-4 rounded-full"
            }
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
