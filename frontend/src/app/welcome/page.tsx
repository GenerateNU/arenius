import React from "react";
import ImageStack from "@/components/onboarding/onboarding-nav";
import Link from "next/link";

const WelcomeMessage: React.FC = () => {
  return (
    <div className="flex h-screen w-full">
      <div className="w-1/3 flex flex-col items-center justify-center p-8 bg-[#F8F8F8]">
        <ImageStack atXero={true} atWelcome={true} />
      </div>

      <div className="w-2/3 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          All done! Welcome to Arenius!
        </h1>
        <Link href="/transactions">
          <button className="w-40 h-10 bg-moss text-white text-sm font-semibold rounded-md">
            Go to transactions
          </button>
        </Link>
      </div>
    </div>
  );
};

export default WelcomeMessage;
