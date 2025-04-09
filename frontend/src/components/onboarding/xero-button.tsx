"use client";

import React, { useEffect, useState } from "react";

const XeroSSOButton: React.FC<{ onGoBack: () => void }> = ({ onGoBack }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    if (
      !document.querySelector(
        'script[src="https://edge.xero.com/platform/sso/xero-sso.js"]'
      )
    ) {
      const script = document.createElement("script");
      script.src = "https://edge.xero.com/platform/sso/xero-sso.js";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  if (!isMounted) return null;

  return (
    <div className="text-1xl font-extrabold p-12 flex flex-col items-center">
      <h2 className="text-3xl font-extrabold p-12">Connect with Xero</h2>
      <span
        data-xero-sso
        data-href={process.env.NEXT_PUBLIC_API_BASE_URL + "/auth/xero"}
        data-label="Sign In with Xero"
      />
      <button
        onClick={onGoBack}
        className="mt-6 bg-gray-300 hover:bg-gray-400 text-black font-semibold px-6 py-2 rounded-md"
      >
        Go Back
      </button>
    </div>
  );
};

export default XeroSSOButton;
