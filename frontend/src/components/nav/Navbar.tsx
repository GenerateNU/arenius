import Link from "next/link";
import React from "react";

export default function Navbar() {
  return (
    <div className={styles.container}>
      <Link href="/">
        <div className={styles.logo}>
          <p>🌳</p>
          <p className={styles.logoText}>Arenius</p>
        </div>
      </Link>
      <Link href="/transactions">
        <div className={styles.dashboardButton}>
          <p className={styles.dashboardButtonText}>Transactions</p>
        </div>
      </Link>
    </div>
  );
}

const styles = {
  container: "flex justify-between py-8 px-16 bg-gray-100",
  logo: "flex text-4xl items-center gap-4",
  logoText: "font-bold",
  dashboardButton: "text-2xl rounded-md bg-primary px-6 py-1",
  dashboardButtonText: "text-white",
};
