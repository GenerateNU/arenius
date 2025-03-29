"use client";
import { DatePicker } from "@/components/dashboard/DatePicker";
import GrossSummary from "@/components/dashboard/GrossEmissionsBarGraph";
import { DateRangeProvider } from "@/context/DateRangeContext";
import React from "react";

import ContactEmissionsTreeMap from "@/components/dashboard/ContactEmissionsTreeMap";
import TopEmissionsFactors from "@/components/dashboard/TopEmissions";
import ScopeBreakdownChart from "@/components/scope-breakdown/scope-breakdown";
import NetEmissionsBarGraph from "@/components/dashboard/NetEmissionsBarGraph";

const DashboardContent: React.FC = () => {
  return (
    <div className="flex flex-col items-center pt-14">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-7xl">
        <div className="lg:col-span-3">
          <h1 className="text-3xl font-bold mb-4">
            Carbon Management Dashboard
          </h1>
        </div>
        <div className="col-span-1">
          <DatePicker />
        </div>
        <div className="lg:col-span-2">
          <GrossSummary />
          <ScopeBreakdownChart />
        </div>

        <div className="col-span-2 ">
          <TopEmissionsFactors />
          <NetEmissionsBarGraph />
        </div>

        <div className="sm:col-span-4 mt-2">
          <ContactEmissionsTreeMap />
        </div>
        <div className="col-span-1 ">
          <p>Other graph</p>
        </div>
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
