import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

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
          height: Math.min(chartContainerRef.current.clientHeight, 400),
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
      colors: ["#71A448"],
      fill: {
        type: "gradient",
        gradient: {
          shade: "dark",
          type: "vertical",
          shadeIntensity: 0.8,
          inverseColors: false,
          gradientToColors: ["#2B3E1B"],
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 73],
          colorStops: [],
        },
      },
      plotOptions: {
        treemap: {
          enableShades: false,
        },
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: "24px",
          fontWeight: "bold",
          fontFamily: 'Arimo, "sans-serif"',
        },
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
    <div
      ref={chartContainerRef}
      id="chart"
      className="treemap-container"
      style={{
        width: "100%",
      }}
    >
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
