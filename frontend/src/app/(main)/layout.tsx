"use client";

import React, { ReactNode, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import ContactsIcon from "@/components/icons/contacts";
import DashboardIcon from "@/components/icons/dashboard";
import TransactionsIcon from "@/components/icons/transactions";
import { ProfileDropdown } from "@/components/user_profile/ProfileDropdown";
import LoadingSpinner from "@/components/ui/loading-spinner";
import onboardingLogo from "@/assets/onboarding-logo.png";
import { Toaster } from "@/components/ui/sonner";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const activeTab = usePathname();
  const [loading, setLoading] = useState(false);
  const [targetPath, setTargetPath] = useState<string>();

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: DashboardIcon },
    { href: "/transactions", label: "Transactions", icon: TransactionsIcon },
    { href: "/contacts", label: "Contacts", icon: ContactsIcon },
  ];

  // Monitor path changes to detect when navigation completes
  useEffect(() => {
    if (targetPath && activeTab === targetPath) {
      setLoading(false);
      setTargetPath(undefined);
    }
  }, [activeTab, targetPath]);

  // Handle navigation with loading state
  const handleNavigation = (href: string) => {
    if (href !== activeTab && href == "/dashboard") {
      setLoading(true);
      setTargetPath(href);

      // Fallback timeout in case navigation takes too long
      const fallbackTimer = setTimeout(() => {
        setLoading(false);
      }, 5000); // 5-second fallback

      return () => clearTimeout(fallbackTimer);
    }
  };

  return (
    <div className="min-h-screen w-full overflow-y-auto">
      {/* Full-screen loading overlay */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-50 z-50">
          <LoadingSpinner size={60} className="opacity-80" />
        </div>
      )}

      <div className="flex h-16 items-center w-full px-4 py-10 space-x-8 bg-white">
        <Link href="/dashboard" className="flex items-center">
          <Image
            src={onboardingLogo}
            alt="Onboarding Logo"
            width={200}
            height={200}
          />
        </Link>
        <div className="flex h-full items-center justify-end w-full max-w-full space-x-6">
          <div className="flex items-center space-x-4">
            {links.map((val) => (
              <Link
                key={val.href}
                href={val.href}
                className={`flex items-center px-4 py-2 rounded-md font-[Montserrat] font-medium ${
                  activeTab === val.href && "bg-[#77B25733]"
                }`}
              >
                <button
                  key={`LINK-${val.href}`}
                  onClick={() => handleNavigation(val.href)}
                  className="text-sm cursor-pointer flex items-center space-x-2"
                >
                  <span className="flex items-center">
                    <val.icon active={false} />
                  </span>
                  <p>{val.label}</p>
                </button>
              </Link>
            ))}
          </div>
          <ProfileDropdown />
        </div>
      </div>
      <div className="flex-grow px-4 md:px-20 bg-grayBackground">
        <Toaster />
        {children}
      </div>
    </div>
  );
};

export default Layout;
