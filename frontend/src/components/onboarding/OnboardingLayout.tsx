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
      <div className={styles.loginSection}>
        <div className={styles.formWrapper}>
          <div className={styles.formContent}>
            <div className={styles.header}>
              <h2 className={styles.welcomeText}>Welcome to</h2>
              <Image src={logo} alt="Onboarding Logo" className={styles.logo} />
            </div>
            <div className={styles.childrenContainer}>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container:
    "h-screen w-full bg-[url('/onboarding-bg.jpeg')] bg-cover bg-center flex",
  loginSection: "3/5 md:w-2/5 flex items-center pl-20",
  formWrapper:
    "h-[80vh] w-full flex flex-col items-center justify-center bg-white/100 px-16 pt-16 rounded-lg shadow-lg font-body",
  formContent: "flex flex-col justify-between h-full pb-24",
  header: "flex flex-col space-y-4",
  welcomeText: "font-header text-2xl",
  logo: "w-100",
  childrenContainer: "w-full",
};
