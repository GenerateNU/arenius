import { formatNumber } from "@/lib/utils";
import React from "react";
import { PieChart, Pie, Label, Cell, Tooltip, TooltipProps } from "recharts";

const COLORS = [
  { id: "1", start: "#D0F5BC", end: "#C3DCB5" },
  { id: "2", start: "#ACC99B", end: "#276E0B" },
  { id: "3", start: "#426227", end: "#0A0F06" },
];

const ScopeChart: React.FC<{
  chartData: { name: string; value: number; fill: string; scope: number }[];
}> = ({ chartData }) => {
  const totalEmissions = chartData.reduce((acc, cur) => acc + cur.value, 0);

  console.log("Chart Data: ", chartData);

  return (
    <PieChart width={300} height={300}>
      <defs>
        {COLORS.map(({ id, start, end }) => (
          <linearGradient id={id} key={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={start} stopOpacity={1} />
            <stop offset="100%" stopColor={end} stopOpacity={1} />
          </linearGradient>
        ))}
      </defs>
      <Pie
        data={chartData}
        dataKey="value"
        nameKey="name"
        innerRadius={90} // Creates donut effect
        outerRadius={120}
        paddingAngle={3}
        stroke="#fff"
        strokeWidth={2}
        cornerRadius={262}
        labelLine={false}
      >
        {chartData.map((_, index) => (
          <Cell key={`cell-${index}`} fill={`url(#${index + 1})`} />
        ))}
        <Label
          value={`${formatNumber(totalEmissions)} kg CO2`}
          position="center"
          fontSize={24}
          fill="#333"
          fontWeight="bold"
          className="font-[Arimo]"
        />
      </Pie>
      <Tooltip content={<CustomTooltip />} />
    </PieChart>
  );
};

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0]?.payload;

  return (
    <div className="bg-white p-3 rounded-lg shadow-md border border-gray-300 font-[Montserrat]">
      <p className="text-md font-semibold">{data?.name}</p>
      <div className="mt-2 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span
            className="w-4 h-4 rounded-full"
            style={{
              backgroundImage: `linear-gradient(to bottom, ${
                COLORS[data?.scope - 1].start
              }, ${COLORS[data?.scope - 1].end})`,
            }}
          />
          <span className="text-sm text-gray-700 font-medium">
            {formatNumber(data?.value)} kg
          </span>
        </div>
      </div>
    </div>
  );
};

export default ScopeChart;
