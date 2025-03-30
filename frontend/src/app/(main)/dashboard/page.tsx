"use client";
import { DatePicker } from "@/components/dashboard/DatePicker";
import GrossSummary from "@/components/dashboard/GrossEmissionsBarGraph";
import { DateRangeProvider } from "@/context/DateRangeContext";
import React from "react";

import Image from "next/image";
import headerImage from "@/assets/onboarding-bg.jpeg";

import ContactEmissionsTreeMap from "@/components/dashboard/ContactEmissionsTreeMap";
import TopEmissionsFactors from "@/components/dashboard/TopEmissions";
import ScopeBreakdownChart from "@/components/scope-breakdown/scope-breakdown";
import NetEmissionsBarGraph from "@/components/dashboard/NetEmissionsBarGraph";

const DashboardContent: React.FC = () => {
  return (
    <div>
      <div className="w-[calc(100%+64px)] pt-24 p-8 overflow-hidden relative rounded-2xl -mx-8">
        <Image
          src={headerImage}
          fill
          className="object-cover z-0"
          quality={100} alt={""}/>
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 to-transparent" />
        <div className="relative z-30 flex flex-row w-full justify-between items-end">
          <h1 className="text-3xl text-primary-foreground font-bold">Carbon Management Dashboard</h1>
          <div>
            <DatePicker />
          </div>
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
