"use client";

import GrossSummary from "@/components/dashboard/GrossEmissionsBarGraph";
import React from "react";

const DashboardPage: React.FC = () => {
  return (
    <div className="flex-col flex-row justify-center items-center">
      <br />
      <h1 className="text-3xl font-bold">Dashboard Page</h1>
      <br />
      <GrossSummary />
    </div>
  );
};

export default DashboardPage;
