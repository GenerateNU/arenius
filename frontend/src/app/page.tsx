"use client";

import React, { useEffect, useState } from "react";
import LoginForm from "@/components/onboarding/login-form";
import SignupForm from "@/components/onboarding/landing";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isLoginPage, setIsLoginPage] = useState(false);
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
