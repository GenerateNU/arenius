"use client";
import { Treemap, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Company A', size: 100 },
  { name: 'Company B', size: 80 },
  { name: 'Company C', size: 60 },
];

const CustomTreemapCell = (props: any) => {
  const { x, y, width, height, name, size, fill } = props;

  return (
    <g>
      {/* Adjust x, y, width, height for padding/gap effect */}
      <rect
        x={x + 2} // Moves rectangle right to create gap
        y={y + 2} // Moves rectangle down to create gap
        width={width - 4} // Reduces width to create gap
        height={height - 4} // Reduces height to create gap
        fill={fill}
        stroke="#fff"
        strokeWidth={2} // Keeps stroke for the rectangle only
      />
      <text
        x={x + width / 2}
        y={y + height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="12"
        fill="white"
      >
        {name}
      </text>
    </g>
  );
};

export default function TreemapChart() {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <Treemap
        width={400}
        height={400}
        data={data}
        dataKey="size"
        fill="#8884d8"
        content={<CustomTreemapCell />}
 // Custom renderer
      />
    </ResponsiveContainer>
  );
}
