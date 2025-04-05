"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "@/components/onboarding/login-form";
import SignupForm from "@/components/onboarding/landing";
import Cookies from "js-cookie";

export default function LoginPage() {
  const router = useRouter();

  const [isLoginPage, setIsLoginPage] = useState(false);

  const jwt = Cookies.get("jwt")
  const userId = Cookies.get("userID")

  useEffect(() => {
    if (jwt && userId) {
      router.push("/dashboard"); 
    }
  }, [jwt, userId, router]);


  return (
    <div className={styles.container}>
      <div className={styles.login}>
        {isLoginPage ? (
          <LoginForm />
        ) : (
          <SignupForm setIsLoginPage={setIsLoginPage} />
        )}
      </div>
    </div>
  );
}

const styles = {
  container:
    "h-screen w-full bg-[url('/onboarding-bg.jpeg')] bg-cover bg-center flex",
  login: "w-2/5 flex items-center justify-start pl-20",
};
