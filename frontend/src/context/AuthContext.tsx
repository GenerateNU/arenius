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
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  jwt: string | undefined;
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
  const [companyId, setCompanyId] = useState<string>();
  const [tenantId, setTenantId] = useState<string>();
  const [userId, setUserId] = useState<string>();
  const [jwt, setJwt] = useState<string>();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Track loading state
  const [authActionTriggered, setAuthActionTriggered] = useState<
    "login" | "signup" | null
  >(null);
  const [isLoginError, setLoginError] = useState<boolean>(false);

  function readCookies() {
    const cookies = ["companyID", "tenantID", "userID", "jwt"];
    const setters = [setCompanyId, setTenantId, setUserId, setJwt];

    cookies.forEach((cookie, index) => {
      const value = Cookies.get(cookie);
      if (value) setters[index](value);
    });
  }

  async function fetchUserData() {
    if (!userId || !jwt) return;

    try {
      setIsLoading(true);
      const response = await fetchUser(userId);
      setUser(response);
      localStorage.setItem("user", JSON.stringify(response));
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUser(null);
      localStorage.removeItem("user");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchUserData();
  }, [userId, jwt]);

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
  }, [authActionTriggered]);

  const login = async (
    item: LoginRequest
  ): Promise<{ response?: AxiosResponse; error?: unknown }> => {
    setIsLoading(true); // Set loading to true when login starts
    setLoginError(false); // Reset error state before attempting login
    try {
      const response = await authApiClient.post("/auth/login", item);

      // Trigger the effect by setting the state
      setAuthActionTriggered("login");

      return { response };
    } catch (error) {
      setLoginError(true);
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
      const response = await authApiClient.post("/auth/signup", payload);
      setAuthActionTriggered("signup");

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
        companyId,
        tenantId,
        userId,
        jwt,
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
