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
    { href: "/dashboard", label: "Dashboard", icon: DashboardIcon },
    { href: "/transactions", label: "Transactions", icon: TransactionsIcon },
    { href: "/contacts", label: "Contacts", icon: ContactsIcon },
  ];

  return (
    <div className="relative overflow-x-hidden flex-1">
      <div
        key="val1"
        className="flex items-center w-full px-4 py-2 space-x-8 bg-white"
      >
        <Link href="/dashboard">
          <Image
            src={onboardingLogo}
            alt="Onboarding Logo"
            width={200}
            height={200}
          />
        </Link>
        <div
          key="val"
          className="flex items-center justify-end w-full max-w-full p-4 space-x-4"
        >
          {links.map((val) => (
            <div
              key={val.href}
              className={`items-center px-4 py-2 rounded-md font-[Montserrat] font-medium ${
                activeTab === val.href && "bg-[#77B25733]"
              }`}
            >
              <Link
                key={`LINK-${val.href}`}
                href={val.href}
                className={`text-sm cursor-pointer flex space-x-2`}
              >
                <val.icon active={false} />
                <p>{val.label}</p>
              </Link>
            </div>
          ))}
          <ProfileDropdown />
        </div>
      </div>
      <div className="px-4 md:px-40 bg-grayBackground h-full">{children}</div>{" "}
    </div>
  );
};

export default Layout;
