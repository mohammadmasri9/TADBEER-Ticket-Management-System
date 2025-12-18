import React from "react";
import { useAuth } from "../context/AuthContext";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: "employee" | "manager" | "admin";
  status: "active" | "disabled";
};

const mockUsers: UserRow[] = [
  {
    id: "u_001",
    name: "Mohammad",
    email: "employee@ooredoo.ps",
    role: "employee",
    status: "active",
  },
  {
    id: "u_002",
    name: "John Manager",
    email: "manager@ooredoo.ps",
    role: "manager",
    status: "active",
  },
  {
    id: "u_003",
    name: "Admin User",
    email: "admin@ooredoo.ps",
    role: "admin",
    status: "active",
  },
];

export default function ManageUsers() {
  const { user } = useAuth();

  if (user?.role !== "admin") {
    return (
      <div style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 12, background: "#f9fafb" }}>
        You don’t have access to this page.
      </div>
    );
  }

  return (
    <>
      <style>{css}</style>

      <div className="users-wrap">
        <header className="users-header">
          <div>
            <h1 className="users-title">Users</h1>
            <p className="users-sub">Manage Tadbeer users, roles, and access.</p>
          </div>

          <button className="users-primary-btn" type="button">
            + New User
          </button>
        </header>

        <section className="users-panel">
          <div className="users-panel-header">
            <h2 className="users-h2">All Users</h2>
            <span className="users-count">{mockUsers.length} total</span>
          </div>

          <div className="users-table-wrap">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="users-cell-main">{u.name}</div>
                    </td>
                    <td>
                      <div className="users-cell-sub">{u.email}</div>
                    </td>
                    <td>
                      <span className={`users-pill users-pill-${u.role}`}>{u.role}</span>
                    </td>
                    <td>
                      <span className={`users-pill users-pill-${u.status}`}>{u.status}</span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button className="users-action-btn" type="button">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}

const css = `
.users-wrap{
  display:grid;
  gap:16px;
}
.users-header{
  display:flex;
  align-items:center;
  justify-content:space-between;
}
.users-title{
  margin:0;
  font-size:24px;
  font-weight:900;
}
.users-sub{
  margin:4px 0 0;
  color:#6b7280;
  font-size:14px;
}
.users-primary-btn{
  padding:8px 14px;
  border-radius:999px;
  border:1px solid #ED1C24;
  background:#ED1C24;
  color:#fff;
  font-weight:800;
  cursor:pointer;
}
.users-primary-btn:hover{
  background:#b91c1c;
  border-color:#b91c1c;
}
.users-panel{
  background:#fff;
  border-radius:12px;
  border:1px solid #e5e7eb;
  padding:14px;
}
.users-panel-header{
  display:flex;
  align-items:center;
  justify-content:space-between;
  margin-bottom:10px;
}
.users-h2{
  margin:0;
  font-size:16px;
  font-weight:800;
}
.users-count{
  font-size:13px;
  color:#6b7280;
}
.users-table-wrap{
  overflow:auto;
}
.users-table{
  width:100%;
  border-collapse:collapse;
  font-size:14px;
}
.users-table th,
.users-table td{
  padding:8px 6px;
  border-bottom:1px solid #e5e7eb;
}
.users-table th{
  text-align:left;
  font-size:12px;
  text-transform:uppercase;
  letter-spacing:.04em;
  color:#9ca3af;
}
.users-cell-main{
  font-weight:600;
}
.users-cell-sub{
  color:#4b5563;
}
.users-pill{
  display:inline-block;
  padding:4px 10px;
  border-radius:999px;
  font-size:11px;
  font-weight:700;
  text-transform:uppercase;
}
.users-pill-employee{
  background:#eff6ff;
  color:#1d4ed8;
}
.users-pill-manager{
  background:#fef3c7;
  color:#b45309;
}
.users-pill-admin{
  background:#fee2e2;
  color:#b91c1c;
}
.users-pill-active{
  background:#dcfce7;
  color:#15803d;
}
.users-pill-disabled{
  background:#f3f4f6;
  color:#6b7280;
}
.users-action-btn{
  padding:4px 10px;
  border-radius:999px;
  border:1px solid #e5e7eb;
  background:#fff;
  font-size:12px;
  font-weight:600;
  cursor:pointer;
}
.users-action-btn:hover{
  background:#f9fafb;
}
`;
