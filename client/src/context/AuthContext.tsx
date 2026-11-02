"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User } from "@/types";
import { loginApi, registerApi, demoSwitchApi, fetchCurrentUser } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  isAgent: boolean;
  assignedLocalities: string[];
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  register: (payload: { name: string; email: string; password: string; role?: "admin" | "agent"; assignedLocalities?: string[] }) => Promise<{ success: boolean; message?: string }>;
  switchDemo: (email: string) => Promise<void>;
  logout: () => void;
}

const DEFAULT_ADMIN: User = {
  _id: "user-admin-prajwal",
  name: "Prajwal Dhande",
  email: "admin@estateiq.com",
  role: "admin",
  assignedLocalities: ["Civil Lines", "Dharampeth", "Vasudev Nagar", "MIHAN", "Manish Nagar", "Trimurti Nagar", "Sadar"],
  activeLeadCount: 0
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize from localStorage or set default Admin
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("estateiq_token");
      const storedUser = localStorage.getItem("estateiq_user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } else {
        // Default to Prajwal Dhande (Admin) so user never sees empty screen
        const defaultTok = "demo-jwt-token-admin";
        localStorage.setItem("estateiq_token", defaultTok);
        localStorage.setItem("estateiq_user", JSON.stringify(DEFAULT_ADMIN));
        setToken(defaultTok);
        setUser(DEFAULT_ADMIN);
      }
    } catch (e) {
      console.warn("[Auth] LocalStorage parse warning:", e);
      setUser(DEFAULT_ADMIN);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await loginApi(email, pass);
      if (res.success && res.token && res.user) {
        localStorage.setItem("estateiq_token", res.token);
        localStorage.setItem("estateiq_user", JSON.stringify(res.user));
        setToken(res.token);
        setUser(res.user);
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message || "Login failed" };
    } catch (err: any) {
      return { success: false, message: err.message || "An error occurred" };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (payload: { name: string; email: string; password: string; role?: "admin" | "agent"; assignedLocalities?: string[] }) => {
    setIsLoading(true);
    try {
      const res = await registerApi(payload);
      if (res.success && res.token && res.user) {
        localStorage.setItem("estateiq_token", res.token);
        localStorage.setItem("estateiq_user", JSON.stringify(res.user));
        setToken(res.token);
        setUser(res.user);
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message || "Registration failed" };
    } catch (err: any) {
      return { success: false, message: err.message || "An error occurred" };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const switchDemo = useCallback(async (email: string) => {
    setIsLoading(true);
    try {
      const res = await demoSwitchApi(email);
      if (res.success && res.token && res.user) {
        localStorage.setItem("estateiq_token", res.token);
        localStorage.setItem("estateiq_user", JSON.stringify(res.user));
        setToken(res.token);
        setUser(res.user);
      }
    } catch (err) {
      console.error("[Auth] Demo switch failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("estateiq_token");
    localStorage.removeItem("estateiq_user");
    setToken(null);
    setUser(null);
  }, []);

  const isAdmin = user?.role === "admin";
  const isAgent = user?.role === "agent";
  const assignedLocalities = user?.assignedLocalities || [];

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAdmin,
        isAgent,
        assignedLocalities,
        login,
        register,
        switchDemo,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
