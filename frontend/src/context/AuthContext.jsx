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
            console.error("❌ Login error:", error);
            
            // Better error handling for mobile
            if (error.response) {
                const status = error.response.status;
                const message = error.response.data?.message || "Invalid Credentials";
                
                if (status === 401) {
                    toast.error("Invalid email or password");
                } else if (status === 404) {
                    toast.error("User not found");
                } else if (status === 500) {
                    toast.error("Server error. Please try again later");
                } else {
                    toast.error(message);
                }
            } else if (error.request) {
                toast.error("Network error. Please check your internet connection");
            } else {
                toast.error("Something went wrong. Please try again");
            }
            
            return { success: false };
        } finally {
            setAuthLoading(false);
        }
    };

    // Register with role support
    const register = async (formData, role = "user") => {
        setAuthLoading(true);
        try {
            console.log("📝 Registering user:", { ...formData, password: "***hidden***" });
            
            const res = await API.post("/auth/register", {
                ...formData,
                role,
            });

            console.log("✅ Registration successful:", res.data);
            
            toast.success(res.data.message || "Registration Successful");
            navigate("/login");

            return { success: true, data: res.data };
        } catch (error) {
            console.error("❌ Registration error:", error);
            
            // Better error handling for registration
            if (error.response) {
                const status = error.response.status;
                const message = error.response.data?.message || "Registration Failed";
                
                if (status === 409) {
                    toast.error("User already exists with this email or meter number");
                } else if (status === 400) {
                    // Show validation errors
                    const errors = error.response.data?.errors;
                    if (errors && Array.isArray(errors)) {
                        toast.error(errors[0]?.msg || message);
                    } else {
                        toast.error(message);
                    }
                } else if (status === 500) {
                    toast.error("Server error. Please try again later");
                } else {
                    toast.error(message);
                }
            } else if (error.request) {
                toast.error("Network error. Please check your internet connection");
            } else {
                toast.error("Something went wrong. Please try again");
            }
            
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