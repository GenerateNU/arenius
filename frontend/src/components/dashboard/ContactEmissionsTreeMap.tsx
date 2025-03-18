"use client"

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
} from "@/components/ui/chart"
import useContactsTree from "@/hooks/useContactsTree"
import { useDateRange } from "@/context/DateRangeContext"
import dynamic from "next/dynamic"
import { ResponsiveContainer } from "recharts"

const TreeMap = dynamic(() => import("@/components/dashboard/treemap"), {
  ssr: false, // Disable server-side rendering for this component
});


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

export default function ContactEmissionsTreeMap() {
  const { treeMapData } = useContactsTree();
  const { dateRange } = useDateRange();
  const formattedStartMonth = new Date(dateRange?.from ?? "").toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }) || ""
  const formattedStartYear = new Date(dateRange?.from ?? "").getFullYear() || ""
  const formattedEndMonth = new Date(dateRange?.to ?? "").toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }) || ""
  const formattedEndYear = dateRange?.to ? new Date(dateRange.to).getFullYear() : ""

  
  return (
    <Card > 
      <CardHeader>
        <CardTitle style={{ fontSize: '1.5rem'}}>Contact Emissions</CardTitle>
        <br />
        <CardDescription>{formattedStartMonth} {formattedStartYear} - {formattedEndMonth} {formattedEndYear}</CardDescription>
      </CardHeader>
      <CardContent style={{ height: "100%", padding: "1rem", paddingTop: "0" }}>
        <ChartContainer config={chartConfig} style={{ height: "100%", paddingTop: "0" }}>
          <ResponsiveContainer width="100%" height="100%">
            <TreeMap data={treeMapData} />
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
