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
  login: (item: LoginRequest) => Promise<{ response?: AxiosResponse, error?: unknown }>;
  signup: (item: SignupRequest) => Promise<{ response?: AxiosResponse, error?: unknown }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);  // Track loading state
  const [authActionTriggered, setAuthActionTriggered] = useState<"login" | "signup" | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("authComplete") === "true") {
      console.log("AUTH COMPLETE")
      setAuthActionTriggered("signup");  // Trigger after Xero authentication is complete
    }
  }, []);
  

  useEffect(() => {
    console.log("authActionTriggered changed:", authActionTriggered);
  }, [authActionTriggered]);

  useEffect(() => {

    if (authActionTriggered) {
      const storedCompanyId = Cookies.get("companyID");
      console.log("COMPANY ID:", storedCompanyId)

      if (storedCompanyId) {
        setCompanyId(storedCompanyId);
      }

      const storedTenantId = Cookies.get("tenantID");
      console.log("TENANT ID:", storedTenantId)
      if (storedTenantId) {
        setTenantId(storedTenantId);
      }

      const storedUserId = Cookies.get("userID");
      if (storedUserId) {
        setUserId(storedUserId);
      }

      // Reset the action after the effect runs to avoid it running continuously
      setAuthActionTriggered(null);
      console.log("Cookies:", Cookies.get())
      console.log(document.cookie);
    }
  }, [authActionTriggered, isLoading]);

  const login = async (item: LoginRequest): Promise<{ response?: AxiosResponse; error?: unknown }> => {
    setIsLoading(true); // Set loading to true when login starts
  
    try {
      const response = await apiClient.post("/auth/login", item);
      
      // Trigger the effect by setting the state
      setAuthActionTriggered("login");
      console.log(response);
      console.log("Cookies:", Cookies.get())
  
      return { response };
    } catch (error) {
      console.error("Login error:", error);
      return { error };
    } finally {
      setIsLoading(false); // Set loading to false when login finishes
    }
  };
  
  const signup = async (item: SignupRequest): Promise<{ response?: AxiosResponse; error?: unknown }> => {
    setIsLoading(true); // Set loading to true when signup starts

    const payload = {
      email: item.email,
      password: item.password,
      first_name: item.firstName,  // Convert camelCase to snake_case
      last_name: item.lastName,    // Convert camelCase to snake_case
    };
  
    try {
      const response = await apiClient.post("/auth/signup", payload);
  
      console.log("Signup successful, setting authActionTriggered...");
      setAuthActionTriggered("signup");
      console.log("Auth action triggered state updated");
  
      return { response };
    } catch (error) {
      console.error("Signup error:", error);
      return { error };
    } finally {
      setIsLoading(false);
    }
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
