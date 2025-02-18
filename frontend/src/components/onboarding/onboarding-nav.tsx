"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import onboardingDetailsLogo from "@/assets/onboarding-details-logo.png";
import onboardingXeroGrayLogo from "@/assets/onboarding-xero-gray-logo.png";
import onboardingXeroGreenLogo from "@/assets/onboarding-xero-green-logo.png";
import onboardingWelcomeGrayLogo from "@/assets/onboarding-welcome-gray-logo.png";

const ImageStack = ({ atXero, atWelcome }: { atXero: boolean; atWelcome: boolean }) => {
  const [isXeroGreen, setIsXeroGreen] = useState(false);
  const [isWelcomeGreen, setIsWelcomeGreen] = useState(false);

  useEffect(() => {
    setIsXeroGreen(atXero);  
    setIsWelcomeGreen(atWelcome);  
  }, [atXero, atWelcome]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex items-center space-x-4">
        <div className="flex flex-col items-center">
          <Image
            src={onboardingDetailsLogo}
            alt="Onboarding Details Logo"
            className="w-16"
          />
          <div className={`w-px h-12 ${isXeroGreen ? "border-l-2 border-solid border-[#59C295]" : "border-l-2 border-dotted border-black"}`} />
        </div>
        <div className="flex flex-col -mt-10">
          <span className="text-lg font-bold">Your details</span>
          <span className="text-lg">Provide an email and password</span>
        </div>
      </div>

      <div className="flex items-center space-x-4 -mb-12">
        <div className="flex flex-col items-center">
          <Image
            src={isXeroGreen ? onboardingXeroGreenLogo : onboardingXeroGrayLogo}
            alt="Onboarding Xero Logo"
            className="w-16 -mt-6"
          />
          <div className={`w-px h-12 ${isWelcomeGreen ? "border-l-2 border-solid border-[#59C295]" : "border-l-2 border-dotted border-black"}`} />
        </div>
        <div className="flex flex-col -mt-16">
          <span className={`text-lg font-bold text-black`}>
            Connect with Xero
          </span>
          <span className={`text-lg text-black`}>
            Import financial data seamlessly
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex flex-col items-center">
          <Image
            src={onboardingWelcomeGrayLogo}
            alt="Onboarding Welcome Logo"
            className="w-16 -mt-6"
          />
        </div>
        <div className="flex flex-col -mt-5">
          <span className={`text-lg font-bold text-black`}>
            Welcome to Arenius
          </span>
          <span className={`text-lg text-black`}>
            Start reconciling our transactions
          </span>
        </div>
      </div>
    </div>
  );
};

export default ImageStack;
