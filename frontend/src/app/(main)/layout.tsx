"use client";
import React, { ReactNode, useState } from "react";
import Image from "next/image";
import onboardingLogo from "@/assets/onboarding-logo.png";
import Link from "next/link";
import DashboardIcon from "@/components/icons/dashboard";
import TransactionsIcon from "@/components/icons/transactions";
import ContactsIcon from "@/components/icons/contacts";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>("all_navs/dashboard");

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="relative overflow-x-hidden flex-1">
      <div className="flex absolute top-0 left-0 w-full p-4 space-x-8">
        <div>
          <Image
            src={onboardingLogo}
            alt="Onboarding Logo"
            width={200}
            height={200}
          />
        </div>
        <div className="flex justify-end w-full max-w-full p-4 space-x-4">
          <div className="z-1">
            <DashboardIcon activeTab={activeTab} />
          </div>
          <Link
            href="/dashboard"
            className={`text-lg font-bold ${
              activeTab === "all_navs/dashboard"
                ? "text-[#07AC5D]"
                : "text-gray-700"
            } pr-5`}
            onClick={() => handleTabClick("all_navs/dashboard")}
          >
            Dashboard
          </Link>
          <div className="z-1">
            <TransactionsIcon activeTab={activeTab} />
          </div>
          <Link
            href="/transactions"
            className={`text-lg font-bold ${
              activeTab === "all_navs/transactions"
                ? "text-[#07AC5D]"
                : "text-gray-700"
            } pr-5`}
            onClick={() => handleTabClick("all_navs/transactions")}
          >
            Transactions
          </Link>
          <div className="z-1">
            <ContactsIcon activeTab={activeTab} />
          </div>
          <Link
            href="/contacts"
            className={`text-lg font-bold ${
              activeTab === "all_navs/contacts"
                ? "text-[#07AC5D]"
                : "text-gray-700"
            } pr-5`}
            onClick={() => handleTabClick("all_navs/contacts")}
          >
            Contacts
          </Link>
        </div>
      </div>
      <div className="pt-10 px-20">{children}</div>
    </div>
  );
};

export default Layout;
