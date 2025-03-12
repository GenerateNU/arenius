import React from "react";
import ReactApexChart from "react-apexcharts";

interface ApexChartProps {
  data: { x: string; y: number }[];
}

const ApexChart: React.FC<ApexChartProps> = ({ data }) => {
  const [state, setState] = React.useState({
    series: [{ data: [] as { x: string; y: number }[] }],
    options: {
      legend: { show: false },
      chart: {
        height: 350,
        type: "treemap" as const,
      },
      title: {
        text: "Carbon by Contact",
        align: "center" as const,
      },
      colors: ["#A1F4A4", "#05C569", "#156641"],
      plotOptions: {
        treemap: {
          distributed: true,
          enableShades: false,
        },
      },
    },
  });

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
    <div>
      <div id="chart">
        <ReactApexChart options={state.options} series={state.series} type="treemap" height={350} />
      </div>
    </div>
  );
};

export default ApexChart;
