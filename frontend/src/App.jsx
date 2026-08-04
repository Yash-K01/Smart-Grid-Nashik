import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { useAuth } from "./context/AuthContext";

// ============================
// Public Pages
// ============================
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

// ============================
// User
// ============================
import UserDashboard from "./components/User/UserDashboard";
import SubmitComplaint from "./components/User/SubmitComplaint";
import TrackComplaint from "./components/User/TrackComplaint";

// ============================
// Admin
// ============================
import AdminDashboard from "./components/Admin/AdminDashboard";
import ManageComplaints from "./components/Admin/ManageComplaints";
import RegisterTechnician from "./components/Admin/RegisterTechnician";
import AssignTechnician from "./components/Admin/AssignTechnician";

// ============================
// Technician
// ============================
import TechnicianDashboard from "./components/Technician/TechnicianDashboard";

// ======================================================
// Protected Route
// ======================================================

const ProtectedRoute = ({ children, roles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                Loading...
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

function App() {
    return (
        <Routes>
            {/* ================= Public ================= */}

            <Route path="/" element={<Home />} />

            <Route path="/login" element={<Login />} />

            <Route path="/register" element={<Register />} />

            {/* ================= USER ================= */}

            <Route
                path="/user/dashboard"
                element={
                    <ProtectedRoute roles={["user"]}>
                        <UserDashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/user/submit-complaint"
                element={
                    <ProtectedRoute roles={["user"]}>
                        <SubmitComplaint />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/user/track-complaint"
                element={
                    <ProtectedRoute roles={["user"]}>
                        <TrackComplaint />
                    </ProtectedRoute>
                }
            />

            {/* ================= ADMIN ================= */}

            <Route
                path="/admin/dashboard"
                element={
                    <ProtectedRoute roles={["admin"]}>
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/complaints"
                element={
                    <ProtectedRoute roles={["admin"]}>
                        <ManageComplaints />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/register-technician"
                element={
                    <ProtectedRoute roles={["admin"]}>
                        <RegisterTechnician />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/assign/:id"
                element={
                    <ProtectedRoute roles={["admin"]}>
                        <AssignTechnician />
                    </ProtectedRoute>
                }
            />

            {/* ================= TECHNICIAN ================= */}

            <Route
                path="/technician/dashboard"
                element={
                    <ProtectedRoute roles={["technician"]}>
                        <TechnicianDashboard />
                    </ProtectedRoute>
                }
            />

            {/* ================= 404 ================= */}

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;