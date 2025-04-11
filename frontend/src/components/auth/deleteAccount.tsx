import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import apiClient from "@/services/apiClient";

const DeleteAccountButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [success, setSuccess] = useState("");
  const { userId } = useAuth();

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    setError("");

    if (!userId) {
      setError("User ID not found. Please log in again.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.delete(
        `/auth/delete-account/${userId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, // Important to include cookies
        }
      );

      const data = response.data || {};

      if (response.status < 200 || response.status >= 300) {
        throw new Error(data.error || "Failed to delete account");
      }

      setSuccess("Account successfully deleted");
      setShowConfirmation(false);

      // Clear cookies and redirect to homepage after a delay
      setTimeout(() => {
        document.cookie.split(";").forEach((cookie) => {
          document.cookie = cookie
            .replace(/^ +/, "")
            .replace(
              /=.*/,
              "=;expires=" + new Date().toUTCString() + ";path=/"
            );
        });
        window.location.href = "/";
      }, 2000);
    } catch (err) {
      if (err instanceof Error) {
        setError(
          err.message || "An error occurred while deleting your account"
        );
      } else {
        setError("An error occurred while deleting your account");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setError("");
  };

  if (showConfirmation) {
    return (
      <div className="flex flex-col items-center p-4 border border-red-300 rounded-md bg-red-50">
        <h3 className="mb-4 text-lg font-medium text-red-700">
          Are you sure you want to delete your account?
        </h3>
        <p className="mb-4 text-sm text-red-600">
          This action cannot be undone. All your data will be permanently
          deleted.
        </p>

        <div className="flex space-x-4">
          <button
            onClick={handleDeleteAccount}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md disabled:opacity-50"
          >
            {isLoading ? "Deleting..." : "Confirm Delete"}
          </button>

          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md disabled:opacity-50"
          >
            Cancel
          </button>
        </div>

        {error && <div className="mt-4 text-red-500 text-sm">{error}</div>}

        {success && (
          <div className="mt-4 text-green-500 text-sm">{success}</div>
        )}
      </div>
    );
  }

  return (
    <p
      className="text-red-600 font-bold cursor-pointer"
      onClick={() => setShowConfirmation(true)}
    >
      Delete Account
    </p>
  );
};

export default DeleteAccountButton;
