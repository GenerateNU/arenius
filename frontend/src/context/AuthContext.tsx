"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { LoginRequest, SignupRequest } from "@/types";
import apiClient from "../services/apiClient";
import { AxiosResponse } from "axios";

interface AuthContextType {
  companyId: string | null;
  tenantId: string | null;
  userId: string | null;
  isLoading: boolean;  // Add isLoading to the context
  login: (item: LoginRequest) => Promise<{ response: AxiosResponse }>;
  signup: (item: SignupRequest) => Promise<{ response: AxiosResponse }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);  // Track loading state
  const [authActionTriggered, setAuthActionTriggered] = useState<"login" | "signup" | null>(null);

  useEffect(() => {
    console.log("useEffect triggered");

    if (authActionTriggered) {
      const storedCompanyId = Cookies.get("companyID");
      console.log("storedCompanyId:", storedCompanyId);

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

      console.log("AuthContext updated after", authActionTriggered);
      console.log("companyId:", storedCompanyId);
      console.log("tenantId:", storedTenantId);
      console.log("userId:", storedUserId);

      // Reset the action after the effect runs to avoid it running continuously
      setAuthActionTriggered(null);
    }
  }, [authActionTriggered]);

  const login = async (item: LoginRequest): Promise<{ response: AxiosResponse }> => {
    console.log("login function called");

    setIsLoading(true);  // Set loading to true when login starts

    const response = await apiClient.post("/auth/login", item);

    // Trigger the effect by setting the state
    setAuthActionTriggered("login");

    setIsLoading(false);  // Set loading to false when login finishes

    return { response };
  };

  const signup = async (item: SignupRequest): Promise<{ response: AxiosResponse }> => {
    console.log("Signup function called");

    setIsLoading(true);  // Set loading to true when signup starts

    const response = await apiClient.post("/auth/signup", item);

    // Trigger the effect by setting the state
    setAuthActionTriggered("signup");

    setIsLoading(false);  // Set loading to false when signup finishes

    return { response };
  };

  return (
    <AuthContext.Provider value={{ companyId, tenantId, userId, isLoading, login, signup }}>
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
