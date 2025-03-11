"use client";

import { DatePicker } from "@/components/dashboard/DatePicker";
import GrossSummary from "@/components/dashboard/GrossEmissionsBarGraph";
import { MonthDurationProvider } from "@/context/MonthDurationContext";
import React from "react";

const DashboardContent: React.FC = () => {
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <DatePicker />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-7xl">
        <div className="col-span-1 lg:grid-cols-3">
          <GrossSummary />
        </div>
        <div className="col-span-1">
          <p className="text-lg">Other graph</p>
        </div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  return (
    <MonthDurationProvider>
      <DashboardContent />
    </MonthDurationProvider>
  );
}
