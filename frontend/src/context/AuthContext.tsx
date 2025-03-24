"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { AxiosResponse } from "axios";
import Cookies from "js-cookie";
import apiClient from "../services/apiClient";
import { LoginRequest, SignupRequest } from "@/types";

interface AuthContextType {
  companyId: string | undefined;
  tenantId: string | undefined;
  userId: string | undefined;
  isLoading: boolean;
  login: (
    item: LoginRequest
  ) => Promise<{ response?: AxiosResponse; error?: unknown }>;
  signup: (
    item: SignupRequest
  ) => Promise<{ response?: AxiosResponse; error?: unknown }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [companyId, setCompanyId] = useState<string>();
  const [tenantId, setTenantId] = useState<string>();
  const [userId, setUserId] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>(false); // Track loading state
  const [authActionTriggered, setAuthActionTriggered] = useState<
    "login" | "signup" | null
  >(null);

  function readCookies() {
    const storedCompanyId = Cookies.get("companyID");
    if (storedCompanyId) {
      setCompanyId(storedCompanyId);
    }

    const storedTenantId = Cookies.get("tenantID");
    if (storedTenantId) {
      setTenantId(storedTenantId);
    }

    const storedUserId = Cookies.get("userID");
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("authComplete") === "true") {
      setAuthActionTriggered("signup"); // Trigger after Xero authentication is complete
    } else {
      readCookies();
    }
  }, []);

  useEffect(() => {
    if (authActionTriggered) {
      readCookies();

      // Reset the action after the effect runs to avoid it running continuously
      setAuthActionTriggered(null);
    }
  }, [authActionTriggered, isLoading]);

  const login = async (
    item: LoginRequest
  ): Promise<{ response?: AxiosResponse; error?: unknown }> => {
    setIsLoading(true); // Set loading to true when login starts

    try {
      const response = await apiClient.post("/auth/login", item);

      // Trigger the effect by setting the state
      setAuthActionTriggered("login");

      return { response };
    } catch (error) {
      console.error("Login error:", error);
      return { error };
    } finally {
      setIsLoading(false); // Set loading to false when login finishes
    }
  };

  const signup = async (
    item: SignupRequest
  ): Promise<{ response?: AxiosResponse; error?: unknown }> => {
    setIsLoading(true); // Set loading to true when signup starts

    const payload = {
      email: item.email,
      password: item.password,
      first_name: item.firstName,
      last_name: item.lastName,
    };

    try {
      const response = await apiClient.post("/auth/signup", payload);
      setAuthActionTriggered("signup");

      return { response };
    } catch (error) {
      console.error("Signup error:", error);
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ companyId, tenantId, userId, isLoading, login, signup }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
