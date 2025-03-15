// pages/contacts.tsx or pages/dashboard.tsx

"use client";

import React from "react";
import useContactsTree from "@/hooks/useContactsTree";
import dynamic from "next/dynamic";

const ApexChart = dynamic(() => import("@/components/dashboard/treemap"), {
  ssr: false, // Disable server-side rendering for this component
});

const DashboardPage: React.FC = () => {
  const data = useContactsTree(); // Get data from the custom hook

  return (
    <div className="flex justify-center items-center w-screen h-screen">
      <h1 className="text-3xl font-bold">Dashboard Page</h1>
      <ApexChart data={data} />
    </div>
  );
};

export default DashboardPage;
