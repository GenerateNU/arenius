"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

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
import { GrossSummaryProvider, useGrossSummary } from "@/context/GrossSummaryContext"
import { useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
const chartData = [
  { co2: "January", scope1: 186, scope2: 80, scope3: 100 },
  { co2: "February", scope1: 305, scope2: 200, scope3: 10 },
  { co2: "March", scope1: 237, scope2: 120, scope3: 10 },
  { co2: "April", scope1: 73, scope2: 190, scope3: 10 },
  { co2: "May", scope1: 209, scope2: 130, scope3: 10 },
  { co2: "June", scope1: 214, scope2: 140, scope3: 200 },
]

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

export default function GrossSummary() {
  return (
    <GrossSummaryProvider>
      <GrossEmissionsBarGraph />
    </GrossSummaryProvider>
  );
}

function GrossEmissionsBarGraph() {
  const { grossSummary, fetchData, req, setReq } = useGrossSummary();
  const monthDuration = req.month_duration || 12; // TODO: switch description to use summary instead?
  // const { companyId } = useAuth();
  const companyId = "0a67f5d3-88b6-4e8f-aac0-5137b29917fd"
  console.log("Company ID:", companyId);
  // const hasFetched = useRef(false);
  // TODO: add GrossSummaryContext here and a parser to make the new chart data.

  // const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setReq({ ...req, month_duration: e.target.value });
  // }; // TODO: make this an onchange for the dropdown?

  // useEffect(() => {
  //   if (companyId && req.company_id !== companyId && !hasFetched.current) {
  //     console.log("Set company id:" + companyId);
  //     setReq({ ...req, company_id: companyId });
  //     hasFetched.current = true;
  //   }
  // }, [companyId, req, setReq]);

  // useEffect(() => {
  //   console.log("hello")
  //   if (req.company_id && !hasFetched.current) {
  //     fetchData();
  //     hasFetched.current = true;
  //   }
  // }, [fetchData, req]);

  // TODO: change the styling of the total_co2
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gross Emissions, {companyId}</CardTitle>
        <CardDescription>Total: {grossSummary.total_co2 || 0} tn</CardDescription>
        <CardDescription>ENTER DATE HERE: {monthDuration} months</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="co2"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
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
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
