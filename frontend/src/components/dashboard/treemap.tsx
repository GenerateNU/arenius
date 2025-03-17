import React, { useEffect, useRef, useState } from "react";
import ReactApexChart from "react-apexcharts";

interface ApexChartProps {
  data: { x: string; y: number }[];
}

const TreeMap: React.FC<ApexChartProps> = ({ data }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chartSize, setChartSize] = useState({ width: 400, height: 400 });

  useEffect(() => {
    const updateSize = () => {
      if (chartContainerRef.current) {
        setChartSize({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    updateSize(); // Initial size update

    const resizeObserver = new ResizeObserver(updateSize);
    if (chartContainerRef.current) {
      resizeObserver.observe(chartContainerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  const [state, setState] = useState({
    series: [{ data: [] as { x: string; y: number }[] }],
    options: {
      legend: { show: false },
      chart: {
        type: "treemap" as const,
      },
      colors: ["#A1F4A4", "#05C569", "#156641"],
      plotOptions: {
        treemap: {
          distributed: true,
          enableShades: false,
          useFillColorAsStroke: false,
          padding: 20, // Adjust spacing between squares
        },
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: '12px',
        },
        formatter: function (text: string, op: { value: string }) {
          return [text, op.value + "%"];
        },
        offsetY: -4,
      },
      yaxis: {
        min: 0,
        showForNullSeries: true,
      },
    },
  });

  useEffect(() => {
    if (data?.length) {
      setState((prevState) => ({
        ...prevState,
        series: [{ data }],
      }));
    }
  }, [data]);

  return (
    <div ref={chartContainerRef} style={{ width: "100%", height: "100%", minHeight: "300px" }}>
      <ReactApexChart 
        options={state.options} 
        series={state.series} 
        type="treemap" 
        width={chartSize.width} 
        height={chartSize.height} 
      />
    </div>
  );
};

export default TreeMap;
