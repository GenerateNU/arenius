"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import useGrossSummary from "@/hooks/useGrossSummary"
import { MonthSummary } from "@/types"

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
  }
} satisfies ChartConfig

export default function GrossEmissionsBarGraph() {
  const { grossSummary } = useGrossSummary();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ fontSize: '1.5rem'}}>Gross Emissions</CardTitle>
        <br />
        <CardDescription style={{ fontSize: '2rem', fontWeight: 'bold' }}>{grossSummary.total_co2?.toLocaleString('en-US') || 0} kg</CardDescription>
        <CardDescription>Total emissions (kg) 
          for {new Date(grossSummary.start_date).toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }) || ""} {new Date(grossSummary.start_date).getFullYear() || ""}
           - {new Date(grossSummary.end_date).toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }) || ""} {new Date(grossSummary.start_date).getFullYear() || ""}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart accessibilityLayer data={
              grossSummary.months?.map((month: MonthSummary) => ({ 
                month: new Date(month.month_start).toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }), 
                scope1: month.scopes.scope_one, 
                scope2: month.scopes.scope_two, 
                scope3: month.scopes.scope_three

              })) ?? []
            }>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={true}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} wrapperStyle={{ width: '12%' }}/>
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="scope1"
              stackId="a"
              fill="var(--color-scope1)"
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="scope2"
              stackId="a"
              fill="var(--color-scope2)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="scope3"
              stackId="a"
              fill="var(--color-scope3)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
