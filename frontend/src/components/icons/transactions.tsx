"use client";
import React from "react";

interface IconProps {
  activeTab: string;
}

const TransactionsIcon: React.FC<IconProps> = ({ activeTab }) => {
  return (
    <svg
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
  );
};

export default TransactionsIcon;
