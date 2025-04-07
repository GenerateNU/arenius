"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import useContactsTree from "@/hooks/useContactsTree";
import { useDateRange } from "@/context/DateRangeContext";
import TreeMap from "@/components/dashboard/treemap";

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

export default function ContactEmissionsTreeMap() {
  const { treeMapData } = useContactsTree();
  const { formattedDateRange } = useDateRange();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-4xl font-[Arimo]">
          Contact Emissions
        </CardTitle>
        <CardDescription className="font-[Montserrat]">
          {formattedDateRange}
        </CardDescription>
      </CardHeader>
      <CardContent className="font-[Montserrat]">
        <ChartContainer
          config={chartConfig}
          className="md:max-h-[400px] w-full"
        >
          <TreeMap data={treeMapData} />
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
