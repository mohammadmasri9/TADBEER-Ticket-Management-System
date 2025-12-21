import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MyTickets from "./pages/MyTickets";
import TicketDetails from "./pages/TicketDetails";
import ManageUsers from "./pages/ManageUsers";
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import './style/Dashboard.css';
import './pages/ManageUsers'
import './pages/Reports'
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import AddUser from "./pages/AddUser";




export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
           
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tickets" element={<MyTickets />} />
        <Route path="/tickets/:id" element={<TicketDetails />} />
        <Route path="/admin/users" element={<ManageUsers />} />
        <Route path="/manager/reports" element={<Reports/>} />
        <Route path="/profile/:id" element={<Profile/>} />
        <Route path="/admin/adduser" element={<AddUser/>} />


      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
