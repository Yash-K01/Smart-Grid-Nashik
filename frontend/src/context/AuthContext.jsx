import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../config/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(false);

    // Role-based redirect mapping
    const roleRedirects = {
        admin: "/admin/dashboard",
        technician: "/technician/dashboard",
        user: "/user/dashboard",
    };

    // Check token expiry
    const isTokenExpired = (token) => {
        try {
            const tokenData = JSON.parse(atob(token.split('.')[1]));
            return tokenData.exp * 1000 < Date.now();
        } catch {
            return true;
        }
    };

    // Load User on Refresh with token validation
    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (token && storedUser) {
            try {
                // Check if token is expired
                if (isTokenExpired(token)) {
                    logout();
                    return;
                }
                setUser(JSON.parse(storedUser));
            } catch (err) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
            }
        }
        setLoading(false);
    }, []);

    // Login
    const login = async (email, password, role) => {
        setAuthLoading(true);
        try {
            const res = await API.post("/auth/login", {
                email,
                password,
                role,
            });

            const { token, user } = res.data;

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));
            setUser(user);

            toast.success("Login Successful");

            const redirectPath = roleRedirects[user.role] || "/user/dashboard";
            navigate(redirectPath);

            return { success: true, user };
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Invalid Credentials"
            );
            return { success: false };
        } finally {
            setAuthLoading(false);
        }
    };

    // Register with role support
    const register = async (formData, role = "user") => {
        setAuthLoading(true);
        try {
            const res = await API.post("/auth/register", {
                ...formData,
                role,
            });

            toast.success(res.data.message || "Registration Successful");
            navigate("/login");

            return { success: true };
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Registration Failed"
            );
            return { success: false };
        } finally {
            setAuthLoading(false);
        }
    };

    // Logout
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        toast.success("Logged Out");
        navigate("/");
    };

    const value = {
        user,
        setUser,
        loading,
        authLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        isTechnician: user?.role === "technician",
        isUser: user?.role === "user",
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;