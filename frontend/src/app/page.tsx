"use client";

import React, { useEffect, useState } from "react";
import LoginForm from "@/components/onboarding/login-form";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";

export default function LoginPage() {
  const router = useRouter();
  const jwt = Cookies.get("jwt");
  const userId = Cookies.get("userID");

  useEffect(() => {
    if (jwt && userId) {
      router.push("/dashboard");
    }
  }, [jwt, userId, router]);

  return (
    <OnboardingLayout>
      <LoginForm />
    </OnboardingLayout>
  );
}
