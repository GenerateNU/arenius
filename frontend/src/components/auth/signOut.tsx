import React, { useState } from "react";
import { LogOut } from "lucide-react";
import apiClient from "@/services/apiClient";
import { useAuth } from "@/context/AuthContext";

const SignOutButton = () => {
  const { setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignOut = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");
    setUser(null);
    localStorage.removeItem("user");

    try {
      const response = await apiClient.post("/auth/sign-out", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important to include cookies
      });

      const data = response.data;

      if (response.status !== 200) {
        throw new Error(data.error || "Failed to sign out");
      }

      setSuccess(data.message || "Successfully signed out");

      window.location.href = "/"; // redirect to login page
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "An error occurred during sign out");
      } else {
        setError("An error occurred during sign out");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleSignOut}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors duration-200 disabled:opacity-50"
      >
        <LogOut size={18} />
        {isLoading ? "Signing out..." : "Sign Out"}
      </button>

      {error && <div className="mt-2 text-red-500 text-sm">{error}</div>}

      {success && <div className="mt-2 text-green-500 text-sm">{success}</div>}
    </div>
  );
};

export default SignOutButton;
