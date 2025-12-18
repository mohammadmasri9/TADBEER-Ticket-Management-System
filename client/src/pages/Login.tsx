import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation() as any;

  const [email, setEmail] = useState("manager@ooredoo.ps"); // change as you want
  const [password, setPassword] = useState("123456");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const redirectTo = loc?.state?.from || "/dashboard";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await login({ email, password });
      nav(redirectTo, { replace: true });
    } catch (e: any) {
      setErr(e?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
      <label style={{ display: "grid", gap: 6 }}>
        <span>Email</span>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@company.com"
          style={{ padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}
        />
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        <span>Password</span>
        <input
          value={password}
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          style={{ padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}
        />
      </label>

      {err && (
        <div style={{ color: "#b91c1c", fontWeight: 600 }}>
          {err}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid #111827",
          background: "#111827",
          color: "white",
          fontWeight: 800,
          cursor: "pointer",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>

      <div style={{ color: "#6b7280", fontSize: 13 }}>
        Tip: use emails containing <b>admin</b> or <b>manager</b> to test roles.
      </div>
    </form>
  );
}
