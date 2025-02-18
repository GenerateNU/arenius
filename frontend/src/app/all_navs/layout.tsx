"use client"
import React, { useState } from "react";
import Image from "next/image";
import onboardingLogo from "@/assets/onboarding-logo.png";
import Link from "next/link"; // For navigation

const Layout: React.FC = ({ children }) => {
  // State to track the active tab
  const [activeTab, setActiveTab] = useState<string>("all_navs/dashboard");

  // Function to handle tab selection
  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="relative max-h-screen overflow-x-hidden flex-1">
    {/* Container for logo and sidebar */}
      <div className="flex absolute top-0 left-0 w-full p-4 space-x-8"> {/* Adjusted left position */}
        {/* Logo */}
        <div>
          <Image
            src={onboardingLogo}
            alt="Onboarding Logo"
            width={200}
            height={200}
          />
        </div>

        {/* Tabs / Sidebar */}
        <div className="flex justify-end w-full max-w-full p-4 space-x-4">
        {/* Dashboard Tab */}
          <svg
            onClick={() => handleTabClick("all_navs/dashboard")}
            width="30"
            height="30"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={activeTab === "all_navs/dashboard" ? "text-[#07AC5D]" : "text-black"}
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M13.3789 1.5H4.62109C4.22574 1.49999 3.88465 1.49998 3.60373 1.52293C3.30722 1.54715 3.01231 1.60064 2.72852 1.74524C2.30516 1.96095 1.96095 2.30516 1.74524 2.72852C1.60064 3.01231 1.54715 3.30722 1.52293 3.60373C1.49998 3.88465 1.49999 4.22572 1.5 4.62106V13.3789C1.49999 13.7743 1.49998 14.1154 1.52293 14.3963C1.54715 14.6928 1.60064 14.9877 1.74524 15.2715C1.96095 15.6948 2.30516 16.0391 2.72852 16.2548C3.01231 16.3994 3.30722 16.4528 3.60373 16.4771C3.88466 16.5 4.22572 16.5 4.62108 16.5H13.3789C13.7743 16.5 14.1153 16.5 14.3963 16.4771C14.6928 16.4528 14.9877 16.3994 15.2715 16.2548C15.6948 16.0391 16.0391 15.6948 16.2548 15.2715C16.3994 14.9877 16.4528 14.6928 16.4771 14.3963C16.5 14.1153 16.5 13.7743 16.5 13.3789V4.62108C16.5 4.22572 16.5 3.88466 16.4771 3.60373C16.4528 3.30722 16.3994 3.01231 16.2548 2.72852C16.0391 2.30516 15.6948 1.96095 15.2715 1.74524C14.9877 1.60064 14.6928 1.54715 14.3963 1.52293C14.1154 1.49998 13.7743 1.49999 13.3789 1.5ZM5.57522 9.17018L9.00002 4.5V7.875H11.941C12.3228 7.875 12.5137 7.875 12.6152 7.954C12.7036 8.02276 12.7567 8.12743 12.7598 8.23938C12.7635 8.368 12.6506 8.52194 12.4248 8.82982L9.00002 13.5V10.125H6.05906C5.67727 10.125 5.48638 10.125 5.38481 10.046C5.29641 9.97724 5.24337 9.87257 5.2402 9.76062C5.23656 9.632 5.34944 9.47806 5.57522 9.17018Z"
              fill="currentColor"
            />
          </svg>
          <Link
            href="/all_navs/dashboard"
            className={`text-lg font-bold ${activeTab === "all_navs/dashboard" ? "text-[#07AC5D]" : "text-gray-700"} pr-5`}
            onClick={() => handleTabClick("all_navs/dashboard")}
          >
            Dashboard
          </Link>

          {/* Transactions Tab */}
          <svg
            onClick={() => handleTabClick("all_navs/transactions")}
            width="30"
            height="30"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={activeTab === "all_navs/transactions" ? "text-[#07AC5D]" : "text-black"}
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M11.9773 9.72725C12.1969 9.50758 12.5531 9.50758 12.7727 9.72725L15.0227 11.9773C15.2424 12.1969 15.2424 12.5531 15.0227 12.7727L12.7727 15.0227C12.5531 15.2424 12.1969 15.2424 11.9773 15.0227C11.7576 14.8031 11.7576 14.4469 11.9773 14.2273L13.8295 12.375L11.9773 10.5227C11.7576 10.3031 11.7576 9.94692 11.9773 9.72725Z"
              fill="currentColor"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M2.8125 12.375C2.8125 12.0643 3.06434 11.8125 3.375 11.8125H14.625C14.9357 11.8125 15.1875 12.0643 15.1875 12.375C15.1875 12.6857 14.9357 12.9375 14.625 12.9375H3.375C3.06434 12.9375 2.8125 12.6857 2.8125 12.375Z"
              fill="currentColor"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6.02275 2.97725C6.24242 3.19692 6.24242 3.55308 6.02275 3.77275L4.1705 5.625L6.02275 7.47725C6.24242 7.69692 6.24242 8.05308 6.02275 8.27275C5.80308 8.49242 5.44692 8.49242 5.22725 8.27275L2.97725 6.02275C2.75758 5.80308 2.75758 5.44692 2.97725 5.22725L5.22725 2.97725C5.44692 2.75758 5.80308 2.75758 6.02275 2.97725Z"
              fill="currentColor"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M2.8125 5.625C2.8125 5.31434 3.06434 5.0625 3.375 5.0625H14.625C14.9357 5.0625 15.1875 5.31434 15.1875 5.625C15.1875 5.93566 14.9357 6.1875 14.625 6.1875H3.375C3.06434 6.1875 2.8125 5.93566 2.8125 5.625Z"
              fill="currentColor"
            />
          </svg>
          <Link
            href="/all_navs/transactions"
            className={`text-lg font-bold ${activeTab === "all_navs/transactions" ? "text-[#07AC5D]" : "text-gray-700"} pr-5`}
            onClick={() => handleTabClick("all_navs/transactions")}
          >
            Transactions
          </Link>

          {/* Contacts Tab */}
          <svg
            onClick={() => handleTabClick("all_navs/contacts")}
            width="30"
            height="30"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={activeTab === "all_navs/contacts" ? "text-[#07AC5D]" : "text-black"}
            >
            <path fillRule="evenodd" clipRule="evenodd" d="M5.25 7.125C5.25 5.05393 6.92893 3.375 9 3.375C11.0711 3.375 12.75 5.05393 12.75 7.125C12.75 9.19607 11.0711 10.875 9 10.875C6.92893 10.875 5.25 9.19607 5.25 7.125Z" fill="currentColor"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M12.931 0.75H5.06903C4.4653 0.749991 3.96703 0.749983 3.56113 0.783146C3.13956 0.81759 2.75203 0.891513 2.38803 1.07698C1.82354 1.3646 1.3646 1.82354 1.07698 2.38803C0.891513 2.75203 0.81759 3.13956 0.783146 3.56113C0.749983 3.96703 0.749991 4.46529 0.75 5.06902V12.931C0.749991 13.5347 0.749983 14.033 0.783146 14.4389C0.81759 14.8604 0.891513 15.248 1.07698 15.612C1.3646 16.1765 1.82354 16.6354 2.38803 16.923C2.75203 17.1085 3.13956 17.1824 3.56113 17.2169C3.96702 17.25 4.46529 17.25 5.06901 17.25H12.931C13.5347 17.25 14.033 17.25 14.4389 17.2169C14.8604 17.1824 15.248 17.1085 15.612 16.923C16.1765 16.6354 16.6354 16.1765 16.923 15.612C17.1085 15.248 17.1824 14.8604 17.2169 14.4389C17.25 14.033 17.25 13.5347 17.25 12.931V5.06901C17.25 4.46529 17.25 3.96702 17.2169 3.56113C17.1824 3.13956 17.1085 2.75203 16.923 2.38803C16.6354 1.82354 16.1765 1.3646 15.612 1.07698C15.248 0.891513 14.8604 0.81759 14.4389 0.783146C14.033 0.749983 13.5347 0.749991 12.931 0.75ZM3.06902 2.41349C3.18632 2.35372 3.35447 2.30503 3.68328 2.27816C4.02085 2.25058 4.45757 2.25 5.1 2.25H12.9C13.5424 2.25 13.9792 2.25058 14.3167 2.27816C14.6455 2.30503 14.8137 2.35372 14.931 2.41349C15.2132 2.5573 15.4427 2.78677 15.5865 3.06902C15.6463 3.18632 15.695 3.35447 15.7218 3.68328C15.7494 4.02085 15.75 4.45757 15.75 5.1V12.9C15.75 13.5424 15.7494 13.9792 15.7218 14.3167C15.7024 14.5549 15.6715 14.7088 15.6332 14.8201C15.2482 13.3124 13.9559 12.1745 12.3676 12.0181C12.1836 11.9999 11.9749 12 11.6684 12H6.33161C6.02516 12 5.81646 11.9999 5.63244 12.0181C4.04416 12.1745 2.75176 13.3124 2.36683 14.8201C2.32855 14.7088 2.29763 14.5549 2.27816 14.3167C2.25058 13.9792 2.25 13.5424 2.25 12.9V5.1C2.25 4.45757 2.25058 4.02085 2.27816 3.68328C2.30503 3.35447 2.35372 3.18632 2.41349 3.06902C2.5573 2.78677 2.78677 2.5573 3.06902 2.41349Z" fill="currentColor"/>
            </svg>

          <Link
            href="/all_navs/contacts"
            className={`text-lg font-bold ${activeTab === "all_navs/contacts" ? "text-[#07AC5D]" : "text-gray-700"} pr-5`}
            onClick={() => handleTabClick("all_navs/contacts")}
          >
            Contacts
          </Link>
        </div>
      </div>

      {/* Children (Dynamic content) */}
      <div className="pt-20 pl-20 pr-10 pb-5">
        {children}
      </div>
    </div>
  );
};

export default Layout;
