// src/routes/AppRoutes.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../src/pages/Login";
import Dashboard from "../src/pages/Dashboard";
import MyTickets from "../src/pages/MyTickets";
import TicketDetails from "../src/pages/TicketDetails";
import ManageUsers from "../src/pages/ManageUsers";
import Reports from "../src/pages/Reports";
import Profile from "../src/pages/Profile";
import AddUser from "../src/pages/AddUser";
import Kanban from "../src/pages/Kanban";
import CreateTicket from "../src/pages/CreateTicket";

import AuthLayout from "../src/layouts/AuthLayout";
import DashboardLayout from "../src/layouts/DashboardLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import Notifications from "../src/pages/Notifications";


import "./style/Dashboard.css";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Protected app routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* default */}
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* pages */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="tickets" element={<MyTickets />} />
        <Route path="tickets/:id" element={<TicketDetails />} />
        <Route path="kanban" element={<Kanban />} />
        <Route path="createticket" element={<CreateTicket />} />

        {/* admin/manager */}
        <Route path="admin/users" element={<ManageUsers />} />
        <Route path="admin/adduser" element={<AddUser />} />
        <Route path="manager/reports" element={<Reports />} />

        {/* profile */}
        <Route path="profile/:id" element={<Profile />} />
      </Route>
<Route path="/notifications" element={<Notifications />} />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}



// app.ts
