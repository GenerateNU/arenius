"use client";
import React, { ReactNode } from "react";
import Image from "next/image";
import onboardingLogo from "@/assets/onboarding-logo.png";
import ContactsIcon from "@/components/icons/contacts";
import DashboardIcon from "@/components/icons/dashboard";
import TransactionsIcon from "@/components/icons/transactions";
import { usePathname } from "next/navigation";
import { ProfileDropdown } from "@/components/user_profile/ProfileDropdown";
import Link from "next/link";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const activeTab = usePathname();

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: DashboardIcon},
    { href: "/transactions", label: "Transactions", icon: TransactionsIcon},
    { href: "/contacts", label: "Contacts", icon: ContactsIcon}
  ];

  return (
    <div className="relative overflow-x-hidden flex-1">
      <div key= "val1" className="z-20 flex absolute top-0 left-0 w-full p-4 space-x-8 bg-white">
        <div>
          <Image
            src={onboardingLogo}
            alt="Onboarding Logo"
            width={200}
            height={200}
          />
        </div>
        <div key="val" className="flex justify-end w-full max-w-full p-4 space-x-4">
          {links.map((val) => 
            <div key={val.href}>
              <div key={`ICON-${val.href}`}className="z-1">
                <val.icon active={activeTab === val.href}/>
              </div>
              <Link key={`LINK-${val.href}`}
                href={val.href}
                className={`text-lg font-bold ${
                  activeTab === val.href ? "text-primary" : "text-gray-700"
                } pr-5`}>
                {val.label}
              </Link>
            </div>
          )}
          <ProfileDropdown></ProfileDropdown>
        </div>
      </div>
      <div className="pt-10 px-20 bg-grayBackground h-full">{children}</div>{" "}
    </div>
  );
};

export default Layout;