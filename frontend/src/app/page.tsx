"use client";

import React, { useState } from "react";
import LoginForm from "@/components/onboarding/login-form";
import SignupForm from "@/components/onboarding/landing";
import { AuthProvider } from "@/context/AuthContext";

export default function LoginPage() {
  const [isLoginPage, setIsLoginPage] = useState(false);

  return (
    <AuthProvider>
      <div className={styles.container}>
        <div className={styles.login}>
          {isLoginPage ? (
            <LoginForm />
          ) : (
            <SignupForm setIsLoginPage={setIsLoginPage} />
          )}
        </div>
      </div>
    </AuthProvider>
  );
}

const styles = {
  container:
    "h-screen w-full bg-[url('../assets/onboarding-bg.jpeg')] bg-cover bg-center flex",
  login: "w-1/2 h-full flex items-center justify-start pl-20",
};
