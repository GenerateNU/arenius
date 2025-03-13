"use client"
import React, { useState, useEffect } from "react";
import { Pie, PieChart, Tooltip } from "recharts";
import ToolTip from "./tooltip";

const ScopePieChart({chartData}) {
    return (
    <PieChart width={600} height={600}>
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
    </PieChart>)
}

export default ScopePieChart