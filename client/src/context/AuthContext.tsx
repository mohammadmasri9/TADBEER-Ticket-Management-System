import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../../api/api";

export type Role = "employee" | "manager" | "admin" | "user" | "agent"; // supports both old + backend roles

export type AuthUser = {
  id: string; // frontend unified id
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
  refreshMe: () => Promise<void>;
};

export const AuthContext = createContext<AuthState | undefined>(undefined);

const LS_KEY = "tadbeer_auth";
const TOKEN_KEY = "token"; // keep for axios interceptor compatibility

function normalizeRole(role: any): Role {
  // backend might send: user/agent/manager/admin OR employee/manager/admin
  if (role === "employee") return "employee";
  if (role === "manager") return "manager";
  if (role === "admin") return "admin";
  if (role === "agent") return "agent";
  return "user";
}

function normalizeUser(u: any): AuthUser {
  return {
    id: (u?._id || u?.id || "").toString(),
    name: u?.name || "User",
    email: u?.email || "",
    role: normalizeRole(u?.role),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session from localStorage on start
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { user: AuthUser; token: string };
        if (parsed?.token) {
          setUser(parsed.user || null);
          setToken(parsed.token);
          localStorage.setItem(TOKEN_KEY, parsed.token); // ensure axios can read it
        }
      }
    } catch {
      // ignore corrupted storage
      localStorage.removeItem(LS_KEY);
      localStorage.removeItem(TOKEN_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveSession = (u: AuthUser, t: string) => {
    setUser(u);
    setToken(t);
    localStorage.setItem(LS_KEY, JSON.stringify({ user: u, token: t }));
    localStorage.setItem(TOKEN_KEY, t); // axios interceptor reads this
  };

  const clearSession = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(LS_KEY);
    localStorage.removeItem(TOKEN_KEY);
  };

  // ✅ Real API login
  const login: AuthState["login"] = async ({ email, password }) => {
    if (!email || !password) throw new Error("Missing credentials");

    // Backend: POST /api/auth/login
    // Expected response: { token, user }
    const res = await api.post("/api/auth/login", {
      email: email.toLowerCase(),
      password,
    });

    const t = res?.data?.token;
    const u = res?.data?.user;

    if (!t || !u) {
      throw new Error("Invalid server response (missing token/user)");
    }

    const normalized = normalizeUser(u);
    saveSession(normalized, t);
  };

  const logout = () => {
    clearSession();
  };

  // ✅ Optional but very useful: validate token + refresh user data
  const refreshMe: AuthState["refreshMe"] = async () => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (!t) {
      clearSession();
      return;
    }

    try {
      const res = await api.get("/api/auth/me");
      const u = res?.data?.user;
      if (!u) throw new Error("No user returned");
      const normalized = normalizeUser(u);
      saveSession(normalized, t);
    } catch {
      // token invalid/expired → force logout
      clearSession();
    }
  };

  const value = useMemo(
    () => ({ user, token, isLoading, login, logout, refreshMe }),
    [user, token, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
