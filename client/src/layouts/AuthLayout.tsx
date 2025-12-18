import React from "react";
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420, border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
        <h1 style={{ margin: 0, marginBottom: 12 }}>Tadbeer</h1>
        <p style={{ marginTop: 0, color: "#6b7280" }}>Sign in to continue.</p>
        <Outlet />
      </div>
    </div>
  );
}
