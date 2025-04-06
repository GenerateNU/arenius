"use client";

import React, { useState } from "react";
import LoginForm from "@/components/onboarding/login-form";
import SignupForm from "@/components/onboarding/landing";

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
    "h-screen w-full bg-[url('/onboarding-bg.jpeg')] bg-cover bg-center flex",
  login: "w-2/5 flex items-center justify-start pl-20",
};
