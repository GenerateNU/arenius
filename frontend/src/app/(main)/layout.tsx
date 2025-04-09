"use client";
import React, { ReactNode, useEffect, useState } from "react";
import Image from "next/image";
import onboardingLogo from "@/assets/onboarding-logo.png";
import ContactsIcon from "@/components/icons/contacts";
import DashboardIcon from "@/components/icons/dashboard";
import TransactionsIcon from "@/components/icons/transactions";
import { usePathname, useRouter } from "next/navigation";
import { ProfileDropdown } from "@/components/user_profile/ProfileDropdown";
import Link from "next/link";
import LoadingSpinner from "@/components/ui/loading-spinner";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const activeTab = usePathname();
  const [loading, setLoading] = useState(false);

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: DashboardIcon },
    { href: "/transactions", label: "Transactions", icon: TransactionsIcon },
    { href: "/contacts", label: "Contacts", icon: ContactsIcon },
  ];

  const [targetPath, setTargetPath] = useState<string | null>(null);

  // Monitor path changes to detect when navigation completes
  useEffect(() => {
    if (targetPath && activeTab === targetPath) {
      setLoading(false);
      setTargetPath(null);
    }
  }, [activeTab, targetPath]);

  // Handle navigation with loading state
  const handleNavigation = (href: string) => {
    if (href !== activeTab) {
      setLoading(true);
      // setTargetPath(href);
      // router.push(href);

      // Fallback timeout in case navigation takes too long
      const fallbackTimer = setTimeout(() => {
        setLoading(false);
      }, 5000); // 5-second fallback

      return () => clearTimeout(fallbackTimer);
    }
  };

  return (
    <div className="min-h-full w-full overflow-y-auto">
      {/* Full-screen loading overlay */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-50 z-50">
          <LoadingSpinner size={60} className="opacity-80" />
        </div>
      )}

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
            <Link
              key={val.href}
              href={val.href}
              className={`relative items-center px-4 py-2 rounded-md font-[Montserrat] font-medium ${
                activeTab === val.href && "bg-[#77B25733]"
              }`}
            >
              <button
                key={`LINK-${val.href}`}
                onClick={() => handleNavigation(val.href)}
                className={`text-sm cursor-pointer flex space-x-2 items-center`}
              >
                <val.icon active={false} />
                <p>{val.label}</p>
              </button>
            </Link>
          ))}
          <ProfileDropdown />
        </div>
      </div>
      <div className="px-4 md:px-20 bg-grayBackground">{children}</div>
    </div>
  );
};

export default Layout;
