"use client";

import React, { useEffect } from "react";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import LoginForm from "@/components/onboarding/login-form";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const jwt = Cookies.get("jwt");
    const userID = Cookies.get("userID");
    const ls_userID = localStorage.getItem("user");
  
    if (ls_userID) {
      const parsedUser = JSON.parse(ls_userID);
      if ((parsedUser["id"] == userID) && (jwt)) {
        router.push('/dashboard')
      }
    } else {
      console.log("User not found in localStorage", jwt, userID);
    }
  }, []);
  
  return (
    <OnboardingLayout>
      <LoginForm />
    </OnboardingLayout>
  );
}
