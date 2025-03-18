import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });


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
        toolbar: {
          show: false,
        },
      },
      colors: ["#A1F4A4", "#05C569", "#156641"],
      plotOptions: {
        treemap: {
          distributed: true,
          enableShades: false,
          useFillColorAsStroke: false,
          padding: 100,
        },
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: '12px',
          fontWeight: 'bold',
        },
        align: "left", // Aligns text to the left
        verticalAlign: "bottom",
        formatter: function (text: string, op: { value: string }) {
          return [op.value + "%", text];
        },
      },
      tooltip: {
        enabled: true,
        y: {
          formatter: function (value: number) {
            return `${value}%`; // Append the percent sign
          },
        },
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

  if (typeof window === "undefined") return null;

  return (
    <div ref={chartContainerRef} style={{ width: "100%", height: "100%", minHeight: "300px" }}>
      <ReactApexChart 
        options={state.options} 
        series={state.series} 
        type="treemap" 
        width={chartSize.width} 
        height={chartSize.height} 
        padding={{ top: 0, right: 0, bottom: 0, left: 0 }}
      />
    </div>
  );
};

export default TreeMap;
