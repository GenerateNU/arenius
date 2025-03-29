import React from "react";
import { PieChart, Pie, Label, Cell, Tooltip } from "recharts";

const ScopeChart: React.FC<{
  chartData: { name: string; value: number; fill: string }[];
}> = ({ chartData }) => {
  const totalEmissions = chartData.reduce((acc, cur) => acc + cur.value, 0);

  return (
    <PieChart width={300} height={300}>
      <Pie
        data={chartData}
        dataKey="value"
        nameKey="name"
        innerRadius={90} // Creates donut effect
        outerRadius={120}
        paddingAngle={3}
        stroke="#fff"
        strokeWidth={2}
        cornerRadius={5}
        labelLine={false}
      >
        {chartData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.fill} />
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
