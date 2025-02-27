"use client"

import React, { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { LoginRequest, SignupRequest } from "@/types";
import apiClient from "../services/apiClient";
import { AxiosResponse } from "axios";

interface AuthContextType {
  companyId: string | null;
  tenantId: string | null;
  userId: string | null;
  login: (item: LoginRequest) => Promise<{ response: AxiosResponse }>;
  signup: (item: SignupRequest) => Promise<{ response: AxiosResponse }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Retrieve id from cookies
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
  }, []);

  const login = async (item: LoginRequest): Promise<{ response: AxiosResponse }> => {
    const response = await apiClient.post("/auth/login", item);
    return { response };
  }

  const signup = async (item: SignupRequest): Promise<{ response: AxiosResponse }> => {
    const response = await apiClient.post("/auth/signup", item);
    return { response };
  }

  return (
    <AuthContext.Provider value={{ companyId, tenantId, userId, login, signup }}>
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
