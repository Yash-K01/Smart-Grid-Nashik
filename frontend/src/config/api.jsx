import axios from "axios";

// Create Axios Instance
const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', // Added fallback
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 30000, // Increased from 10000 to 30000
    withCredentials: true, // Added for CORS
});

// ================================
// Request Interceptor
// ================================
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// ================================
// Response Interceptor
// ================================
API.interceptors.response.use(
    (response) => response,

    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export default API;