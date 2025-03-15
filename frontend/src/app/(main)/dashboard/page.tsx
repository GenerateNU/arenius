"use client";

import { DatePicker } from "@/components/dashboard/DatePicker";
import GrossSummary from "@/components/dashboard/GrossEmissionsBarGraph";
import { DateRangeProvider } from "@/context/DateRangeContext";
import React from "react";

import useContactsTree from "@/hooks/useContactsTree";
import dynamic from "next/dynamic";

const ApexChart = dynamic(() => import("@/components/dashboard/treemap"), {
  ssr: false, // Disable server-side rendering for this component
});

const DashboardContent: React.FC = () => {
  const data = useContactsTree();

  return (
    <div className="flex flex-col items-center pt-14">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-7xl">
        <div className="lg:col-span-3">
          <h1 className="text-3xl font-bold mb-4">Carbon Management Dashboard</h1>
        </div>
        <div className="col-span-1">
          <DatePicker />
        </div>

        <div className="lg:col-span-3">
          <GrossSummary />
        </div>
        <div className="col-span-1">
          <ApexChart data={data} />
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
