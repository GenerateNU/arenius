"use client";
import { DatePicker } from "@/components/dashboard/DatePicker";
import GrossSummary from "@/components/dashboard/GrossEmissionsBarGraph";
import { DateRangeProvider, useDateRange } from "@/context/DateRangeContext";
import React, { useEffect, useRef } from "react";

import Image from "next/image";
import headerImage from "@/assets/onboarding-bg.jpeg";

import ContactEmissionsTreeMap from "@/components/dashboard/ContactEmissionsTreeMap";
import TopEmissionsFactors from "@/components/dashboard/TopEmissions";
import ScopeBreakdownChart from "@/components/scope-breakdown/scope-breakdown";
import NetEmissionsBarGraph from "@/components/dashboard/NetEmissionsBarGraph";

const DashboardContent: React.FC = () => {
  const { dateRange, setDateRange } = useDateRange();

  // References to the containers
  const topLeftRef = useRef<HTMLDivElement>(null);
  const topRightRef = useRef<HTMLDivElement>(null);
  const bottomLeftRef = useRef<HTMLDivElement>(null);
  const bottomRightRef = useRef<HTMLDivElement>(null);

  // Function to adjust heights
  useEffect(() => {
    const adjustHeights = () => {
      // Reset heights before recalculating
      if (topLeftRef.current) topLeftRef.current.style.height = "auto";
      if (topRightRef.current) topRightRef.current.style.height = "auto";
      if (bottomLeftRef.current) bottomLeftRef.current.style.height = "auto";
      if (bottomRightRef.current) bottomRightRef.current.style.height = "auto";

      // Wait for next frame to ensure heights have been reset
      requestAnimationFrame(() => {
        // Adjust only on desktop layout
        if (window.innerWidth >= 1024) {
          // lg breakpoint
          // Adjust top row
          if (topLeftRef.current && topRightRef.current) {
            const height = Math.max(
              topLeftRef.current.scrollHeight,
              topRightRef.current.scrollHeight
            );
            topLeftRef.current.style.height = `${height}px`;
            topRightRef.current.style.height = `${height}px`;
          }

          // Adjust bottom row
          if (bottomLeftRef.current && bottomRightRef.current) {
            const height = Math.max(
              bottomLeftRef.current.scrollHeight,
              bottomRightRef.current.scrollHeight
            );
            bottomLeftRef.current.style.height = `${height}px`;
            bottomRightRef.current.style.height = `${height}px`;
          }
        }
      });
    };

    // Initial adjustment with a slight delay to ensure components are fully rendered
    const timer = setTimeout(adjustHeights, 100);

    // Adjust on window resize
    window.addEventListener("resize", adjustHeights);

    // Cleanup
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", adjustHeights);
    };
  }, []);

  return (
    <div>
      <div className="w-[calc(100%+64px)] pt-24 p-8 overflow-hidden relative rounded-2xl -mx-8">
        <Image
          src={headerImage}
          fill
          className="object-cover z-0"
          quality={100}
          alt={""}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 to-transparent" />
        <div className="relative z-30 flex flex-row w-full justify-between items-end">
          <h1 className="text-3xl text-primary-foreground font-bold">
            Carbon Management Dashboard
          </h1>
          <div>
            <DatePicker
              dateRange={dateRange ?? { from: undefined, to: undefined }}
              setDateRange={setDateRange}
            />
          </div>
        </div>
      </div>

      {/* Main dashboard grid */}
      <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-2">
        {/* Left column */}
        <div className="lg:col-span-7 col-span-1 flex flex-col gap-2">
          <div ref={topLeftRef} className="rounded-lg p-2">
            <GrossSummary />
          </div>
          <div ref={bottomLeftRef} className="rounded-lg p-2">
            <ScopeBreakdownChart />
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-5 col-span-1 flex flex-col gap-2">
          <div ref={topRightRef} className="rounded-lg p-2">
            <TopEmissionsFactors />
          </div>
          <div ref={bottomRightRef} className="rounded-lg p-2">
            <NetEmissionsBarGraph />
          </div>
        </div>
      </div>

      {/* Bottom section with responsive margin */}
      <div className="mt-12 sm:mt-10 lg:mt-6 rounded-lg p-2">
        <ContactEmissionsTreeMap />
      </div>
    </div>
  );
};

export default function DashboardPage() {
  return (
    <DateRangeProvider>
      <DashboardContent />
    </DateRangeProvider>
  );
}
