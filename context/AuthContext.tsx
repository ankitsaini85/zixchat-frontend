"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getToken, getUser, logout as clearAuth } from "@/lib/auth";

type AuthContextType = {
  isLoggedIn: boolean;
  user: any;
  login: () => void;
  logout: () => void;
  refreshUser: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = getToken();
    const userData = getUser();
    setIsLoggedIn(!!token);
    setUser(userData);
  }, []);

  const login = () => {
    const userData = getUser();
    setIsLoggedIn(true);
    setUser(userData);
  };

  const refreshUser = () => {
    const userData = getUser();
    setUser(userData);
  };

  const logout = () => {
    clearAuth();
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
};
