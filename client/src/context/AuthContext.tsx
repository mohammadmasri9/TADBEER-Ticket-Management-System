import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Role = "employee" | "manager" | "admin";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (args: { email: string; password: string }) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthState | undefined>(undefined);

const LS_KEY = "tadbeer_auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { user: AuthUser; token: string };
        setUser(parsed.user);
        setToken(parsed.token);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login: AuthState["login"] = async ({ email, password }) => {
    // TODO: Replace with real API call when backend is ready.
    // Temporary fake login (so pages work now)
    if (!email || !password) throw new Error("Missing credentials");

    const fakeUser: AuthUser = {
      id: "u_001",
      name: email.includes("admin") ? "Admin User" : "Mohammad",
      email,
      role: email.includes("admin") ? "admin" : email.includes("manager") ? "manager" : "employee",
    };

    const fakeToken = "dev-token";

    setUser(fakeUser);
    setToken(fakeToken);
    localStorage.setItem(LS_KEY, JSON.stringify({ user: fakeUser, token: fakeToken }));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(LS_KEY);
  };

  const value = useMemo(
    () => ({ user, token, isLoading, login, logout }),
    [user, token, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
