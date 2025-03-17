import React from "react";
import ReactApexChart from "react-apexcharts";

interface ApexChartProps {
  data: { x: string; y: number }[];
}

const TreeMap: React.FC<ApexChartProps> = ({ data }) => {
  const [state, setState] = React.useState({
    series: [{ data: [] as { x: string; y: number }[] }],
    options: {
      legend: { show: false },
      chart: {
        height: 300,
        type: "treemap" as const,
      },
      colors: ["#A1F4A4", "#05C569", "#156641"],
      plotOptions: {
        treemap: {
          distributed: true,
          enableShades: false,
        },
      },
      yaxis: {
        min: 0, // Set minimum for y-axis so even small or zero values show up
        showForNullSeries: true,
      },
    },
  });

  // Dynamically adjust the chart size
  const [chartSize, setChartSize] = React.useState({ width: 600, height: 350 });

  // Handle resizing
  const updateChartSize = () => {
    const containerWidth = window.innerWidth * 0.9;  // Adjust this percentage as per your layout
    const containerHeight = window.innerHeight * 0.4;  // Adjust this as needed
    setChartSize({ width: containerWidth, height: containerHeight });
  };

  React.useEffect(() => {
    updateChartSize();
    window.addEventListener("resize", updateChartSize);

    return () => {
      window.removeEventListener("resize", updateChartSize);
    };
  }, []);

  // Update state when `data` prop changes
  React.useEffect(() => {
    if (data?.length) {
      setState((prevState) => ({
        ...prevState,
        series: [{ data }],
      }));
    }
  }, [data]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div id="chart">
        <ReactApexChart 
          options={state.options} 
          series={state.series} 
          type="treemap" 
          width={chartSize.width} 
          height={chartSize.height} 
        />
      </div>
    </div>
  );
};

export default TreeMap;
