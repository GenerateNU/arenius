"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { AxiosResponse } from "axios";
import Cookies from "js-cookie";
import authApiClient from "../services/authApiClient";
import { LoginRequest, SignupRequest, User } from "@/types";
import { fetchUser } from "@/services/user";

interface AuthContextType {
  companyId: string | undefined;
  tenantId: string | undefined;
  userId: string | undefined;
  jwt: string | undefined;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isLoading: boolean;
  isLoginError: boolean;
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
  // Consolidated state for authentication-related data
  const [authState, setAuthState] = useState({
    companyID: undefined as string | undefined,
    tenantID: undefined as string | undefined,
    userID: undefined as string | undefined,
    jwt: undefined as string | undefined,
  });

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoginError, setLoginError] = useState<boolean>(false);

  // Helper function to read cookies and update auth state
  const readCookies = () => {
    const keys = ["companyID", "tenantID", "userID", "jwt"];
    const newAuthState: Partial<typeof authState> = {};

    keys.forEach((key) => {
      const cookieValue = Cookies.get(key);
      if (cookieValue) {
        newAuthState[key as keyof typeof authState] = cookieValue;
      }
    });

    setAuthState((prev) => ({ ...prev, ...newAuthState }));
  };

  // Fetch user data based on userId
  const fetchUserData = async () => {
    if (!authState.userID) return;

    setIsLoading(true);
    try {
      const userData = await fetchUser(authState.userID);
      setUser(userData);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle authentication completion (e.g., after signup or login)
  const handleAuthCompletion = () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("authComplete") === "true") {
      readCookies();
    }
  };

  // Effect to initialize authentication state
  useEffect(() => {
    handleAuthCompletion();
    readCookies();
  }, []);

  // Effect to fetch user data when userId changes
  useEffect(() => {
    if (authState.userID) {
      fetchUserData();
    }
  }, [authState.userID]);

  const login = async (
    item: LoginRequest
  ): Promise<{ response?: AxiosResponse; error?: unknown }> => {
    setIsLoading(true);
    setLoginError(false);

    try {
      const response = await authApiClient.post("/auth/login", item);
      readCookies(); // Update cookies after login
      return { response };
    } catch (error) {
      setLoginError(true);
      console.error("Login error:", error);
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (
    item: SignupRequest
  ): Promise<{ response?: AxiosResponse; error?: unknown }> => {
    setIsLoading(true);

    const payload = {
      email: item.email,
      password: item.password,
      first_name: item.firstName,
      last_name: item.lastName,
    };

    try {
      const response = await authApiClient.post("/auth/signup", payload);
      readCookies(); // Update cookies after signup
      return { response };
    } catch (error) {
      setLoginError(true);
      console.error("Signup error:", error);
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        companyId: authState.companyID,
        tenantId: authState.tenantID,
        userId: authState.userID,
        jwt: authState.jwt,
        user,
        setUser,
        isLoading,
        isLoginError,
        login,
        signup,
      }}
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
