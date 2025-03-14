"use client"
import React from "react";
import { Tooltip } from "recharts";

function ToolTip() {
    return (
        <Tooltip
            formatter={(value: number, name: string) => [
                <div key="name">
                    <div style={{ fontWeight: "normal", textAlign: "center" }}>
                        {name}
                    </div>
                    <div style={{ fontWeight: "bold", textAlign: "center" }}>
                        {`${value.toLocaleString()} kg CO2`}
                    </div>
                </div>
            ]}
            labelFormatter={(label: string) => label}
        />
    );
}

export default ToolTip;
