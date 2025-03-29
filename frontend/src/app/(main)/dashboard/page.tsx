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
    <div>
      <div>
        <h1 className="text-3xl font-bold mb-4">Carbon Management Dashboard</h1>
        <div>
          <DatePicker />
        </div>
      </div>
      <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2">
        <div className="lg:col-span-7 sm:col-span-2 col-span-1 space-y-4 ">
          <GrossSummary />
          <ScopeBreakdownChart />
        </div>
        <div className="col-span-1 sm:col-span-2 lg:col-span-5 space-y-4 ">
          <TopEmissionsFactors />
          <NetEmissionsBarGraph />
        </div>
      </div>
      <div className="lg:col-span-5 col-span-1 mt-2">
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
