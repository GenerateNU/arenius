// app/contacts/page.tsx
"use client";

import React from "react";
import dynamic from "next/dynamic";

const ApexChart = dynamic(() => import("@/components/dashboard/treemap"), {
  ssr: false, // Ensures it only renders on the client
});

const ContactsPage: React.FC = () => {
  return (
    <div className="flex justify-center items-center w-screen h-screen">
      <h1 className="text-3xl font-bold">Dashboard Page</h1>
      <ApexChart />
    </div>
  );
};

export default ContactsPage;
