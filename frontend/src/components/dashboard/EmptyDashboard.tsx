// EmptyDashboard.tsx
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const EmptyDashboard: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center max-w-3xl h-full bg-white my-16 py-16 px-28">
      <Image
        src="/pickle.png"
        width={150}
        height={150}
        alt="Frog with top hat"
      />
      <h2 className="text-md font-medium my-4 text-center max-w-4xl">
        No carbon emissions data available for the selected date range. Please
        adjust the date range or visit the transactions page to add or reconcile
        transactions.
      </h2>
      <Link href="/transactions">
        <Button className="px-6">Go to Transactions</Button>
      </Link>
    </div>
  );
};

export default EmptyDashboard;
