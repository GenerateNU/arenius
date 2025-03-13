import React from "react";
import { PieChart, Pie } from "recharts";
import ToolTip from "./tooltip";

const ScopeChart: React.FC<{
  chartData: { name: string; value: number }[];
}> = ({ chartData }) => {
  return (
    <PieChart width={300} height={300}>
      <Pie
        data={chartData}
        dataKey="value"
        nameKey="name"
        innerRadius={90}
        outerRadius={120}
        paddingAngle={3}
        stroke="#fff"
        strokeWidth={2}
        cornerRadius={5}
        labelLine={false}
      />
      <ToolTip />
    </PieChart>
  );
};

export default ScopeChart;
