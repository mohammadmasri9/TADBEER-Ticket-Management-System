import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation() as any;

  const [email, setEmail] = useState("manager@ooredoo.ps");
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
      // Supports axios errors and normal thrown errors
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        e?.toString?.() ||
        "Login failed";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.brandRow}>
          <div style={styles.logoDot} />
          <div>
            <h1 style={styles.title}>TADBEER</h1>
            <p style={styles.subTitle}>Sign in to continue</p>
          </div>
        </div>

        {err && <div style={styles.errorBox}>{err}</div>}

        <form onSubmit={onSubmit} style={styles.form}>
          <label style={styles.label}>
            <span style={styles.labelText}>Email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              autoComplete="email"
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            <span style={styles.labelText}>Password</span>
            <input
              value={password}
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              style={styles.input}
            />
          </label>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <div style={styles.tip}>
            Tip: use emails containing <b>admin</b> or <b>manager</b> to test roles.
          </div>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "calc(100vh - 120px)",
    display: "grid",
    placeItems: "center",
    padding: 20,
    background:
      "radial-gradient(1200px 600px at 10% 10%, rgba(237, 28, 36, 0.12), transparent 55%)," +
      "radial-gradient(900px 500px at 90% 30%, rgba(65, 64, 66, 0.10), transparent 60%)," +
      "#F1F2F2",
  },
  card: {
    width: "100%",
    maxWidth: 460,
    borderRadius: 18,
    background: "#FFFFFF",
    border: "1px solid #E6E7E8",
    boxShadow: "0 14px 40px rgba(0,0,0,0.08)",
    padding: 18,
  },
  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  logoDot: {
    width: 44,
    height: 44,
    borderRadius: 14,
    background: "#ED1C24",
    boxShadow: "0 10px 25px rgba(237, 28, 36, 0.25)",
  },
  title: {
    margin: 0,
    fontSize: 22,
    letterSpacing: 1,
    color: "#414042",
    fontWeight: 900,
  },
  subTitle: {
    margin: "4px 0 0",
    fontSize: 13,
    color: "#808285",
  },
  form: {
    display: "grid",
    gap: 12,
  },
  label: {
    display: "grid",
    gap: 6,
  },
  labelText: {
    fontSize: 13,
    fontWeight: 700,
    color: "#414042",
  },
  input: {
    padding: "12px 12px",
    borderRadius: 12,
    border: "1px solid #D1D3D4",
    outline: "none",
    fontSize: 14,
  },
  button: {
    padding: "12px 12px",
    borderRadius: 12,
    border: "none",
    background: "#ED1C24",
    color: "#FFFFFF",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 10px 25px rgba(237, 28, 36, 0.2)",
    opacity: 1,
  },
  errorBox: {
    background: "#FFE8EA",
    border: "1px solid #F7B0B4",
    color: "#A4000F",
    padding: "10px 12px",
    borderRadius: 12,
    fontWeight: 700,
    fontSize: 13,
    marginBottom: 12,
  },
  tip: {
    color: "#808285",
    fontSize: 13,
    marginTop: 4,
  },
};
