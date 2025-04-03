import React from "react";
import { PieChart, Pie, Label, Cell, Tooltip } from "recharts";

const COLORS = [
  { start: "#9e54ed", end: "#5c4cb6" },
  { start: "#34c3ff", end: "#2876bd" },
  { start: "#da9d35", end: "#e96935" },
];

const ScopeChart: React.FC<{
  chartData: { name: string; value: number; fill: string }[];
}> = ({ chartData }) => {
  const totalEmissions = chartData.reduce((acc, cur) => acc + cur.value, 0);

  console.log("Chart Data: ", chartData);

  return (
    <PieChart width={300} height={300}>
      {/* <defs>
        {chartData.map((entry, index) => (
          <linearGradient id={`myGradient${index}`}>
            <stop offset="0%" stopColor={COLORS[index % COLORS.length].start} />
            <stop offset="100%" stopColor={COLORS[index % COLORS.length].end} />
          </linearGradient>
        ))}
      </defs> */}

      <defs>
        <linearGradient id="1">
          <stop offset="0%" stopColor="#D0F5BC" stopOpacity={1} />
          <stop offset="100%" stopColor="#C3DCB5" stopOpacity={1} />
        </linearGradient>
        <linearGradient id="2">
          <stop offset="0%" stopColor="#ACC99B" stopOpacity={1} />
          <stop offset="100%" stopColor="#276E0B" stopOpacity={1} />
        </linearGradient>
        <linearGradient id="3">
          <stop offset="0%" stopColor="#426227" stopOpacity={1} />
          <stop offset="100%" stopColor="#0A0F06" stopOpacity={1} />
        </linearGradient>
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
          value={`${totalEmissions.toFixed(0).toLocaleString()} kg CO2`}
          position="center"
          fontSize={24}
          fill="#333"
          fontWeight="bold"
        />
      </Pie>

      <Tooltip />
    </PieChart>
  );
};

export default ScopeChart;
