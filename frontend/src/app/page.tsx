"use client";

import TextInput from "@/components/base/textInput";
import Button from "@/components/base/button";
import React, { useState } from "react";
import { login } from "@/services/login";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await login({
        email,
        password,
      });

      if (response?.status === 200) {
        router.push("/transactions");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <h2 className={styles.header}>Welcome to Arenius!</h2>

          <TextInput
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
          />
          <TextInput
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />

          <div className={styles.checkboxContainer}>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              Remember me
            </label>
            <a href="" className="text-black-500 hover:underline">Forgot Password?</a>
          </div>

          <Button id="login-btn" label="Login" type="submit" error={error} />
        </form>

        <div className={styles.signUpContainer}>
          Don&apos;t have an account? <a href="" className="text-blue-500 hover:underline">Sign up!</a>
        </div>
      </div>

      <div className="w-1/2 bg-gray-200"></div>
    </div>
  );
}

const styles = {
  container: "flex h-screen",
  formContainer: "w-1/2 flex flex-col items-center justify-center bg-gray-100",
  form: "bg-white p-6 rounded-lg shadow-md w-96",
  header: "text-xl font-semibold mb-4 text-black text-center",
  checkboxContainer: "flex justify-between items-center text-black text-sm mt-3",
  signUpContainer: "w-full mt-3 text-center text-black",
};
