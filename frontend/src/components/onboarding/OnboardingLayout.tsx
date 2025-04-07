import React from "react";
import Image from "next/image";
import logo from "@/assets/onboarding-logo.png";

export default function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={styles.container}>
      <div className={styles.login}>
        <div className={styles.formContainer}>
          <div className="flex flex-col justify-between h-full pb-24">
            <div className="flex flex-col space-y-4">
              <h2 className="font-header text-2xl">Welcome to</h2>
              <Image src={logo} alt="Onboarding Logo" className={styles.logo} />
            </div>
            <div className="w-full">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container:
    "h-screen w-full bg-[url('/onboarding-bg.jpeg')] bg-cover bg-center flex",
  login: "w-2/5 flex items-center pl-20",
  formContainer:
    "h-[80vh] w-full flex flex-col items-center justify-center bg-white/100 px-16 pt-16 rounded-lg shadow-lg font-body",
  logo: "w-100",
};
