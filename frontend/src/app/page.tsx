"use client";

import React, { useState } from "react";
import { z } from "zod";
import LoginForm from "@/components/ui/login-form";
import SignupForm from "@/components/ui/landing";

export default function LoginPage() {
  const [isLoginPage, setIsLoginPage] = useState(false); 

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
    "h-screen w-full bg-[url('../assets/onboarding-bg.jpeg')] bg-cover bg-center flex",
  login:
  "w-1/2 h-full flex items-center justify-start pl-20"
};
