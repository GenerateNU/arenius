"use client"

import { fetchUser } from "@/services/user";
import { LoginRequest, SignupRequest, User } from "@/types";
import { AxiosResponse } from "axios";
import Cookies from "js-cookie";
import React, { createContext, useContext, useEffect, useState } from "react";
import authApiClient from "../services/authApiClient";

interface AuthContextType {
  companyId: string | undefined;
  tenantId: string | undefined;
  userId: string | undefined;
  user: User | null;
  setUser: (user: User | null) => void;
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
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
      setUser(null);
      localStorage.removeItem("user");
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function setUserInCache(updatedUser: User | null) {
    setUser(updatedUser);
    if (updatedUser) {
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } else {
      localStorage.removeItem("user");
    }
  }

  // Initialize state on mount
  useEffect(() => {
    // Read cookies to populate initial state
    readCookies();

    // Check for stored user in localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
        localStorage.removeItem("user");
      }
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (userId && jwt && !user) {
      fetchUserData();
    }
  }, [userId, jwt]);

  const login = async (
    item: LoginRequest
  ): Promise<{ response?: AxiosResponse; error?: unknown }> => {
    setIsLoading(true);
    setLoginError(false);

    try {
      const response = await authApiClient.post("/auth/login", item);

      setUserId(response.data.user.id);
      setJwt(response.data.access_token);

      fetchUserData();

      return { response };
    } catch (error) {
      setLoginError(true);
      console.error("Login error:", error);
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

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

      setUserId(response.data.user.id);
      setJwt(response.data.access_token);

      fetchUserData();

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
        setUser: setUserInCache,
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