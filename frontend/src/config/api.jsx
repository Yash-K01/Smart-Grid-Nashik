import axios from "axios";

// Create Axios Instance
const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api", 
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 60000,
    withCredentials: true,
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
        console.log('📤 API Request:', {
            url: config.url,
            method: config.method,
            data: config.data
        });
        return config;
    },
    (error) => Promise.reject(error)
);

// ================================
// Response Interceptor
// ================================
API.interceptors.response.use(
    (response) => {
        console.log('📥 API Response:', {
            status: response.status,
            data: response.data
        });
        return response;
    },

    (error) => {
        console.error('❌ API Error:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });

        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export default API;