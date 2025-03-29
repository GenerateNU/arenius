"use client";
import { DatePicker } from "@/components/dashboard/DatePicker";
import GrossSummary from "@/components/dashboard/GrossEmissionsBarGraph";
import { DateRangeProvider } from "@/context/DateRangeContext";
import React, { useEffect } from "react";

import ContactEmissionsTreeMap from "@/components/dashboard/ContactEmissionsTreeMap";
import ScopeBreakdownChart from "@/components/scope-breakdown/scope-breakdown";
import { fetchNetEmissions } from "@/services/dashboard";
import { useAuth } from "@/context/AuthContext";
import { GetGrossEmissionsRequest } from "@/types";
import NetEmissionsBarGraph from "@/components/dashboard/NetEmissionsBarGraph";

const DashboardContent: React.FC = () => {
  const { companyId } = useAuth();

  useEffect(() => {
    if (!companyId) {
      return;
    }

    fetchNetEmissions({
      company_id: companyId,
      start_date: new Date("2023-01-01"),
      end_date: new Date(),
    } as GetGrossEmissionsRequest)
      .then((data) => {
        console.log("Net Emissions Data:", data);
      })
      .catch((error) => {
        console.error("Error fetching net emissions data:", error);
      });
  }, [companyId]);

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
