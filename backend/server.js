const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const morgan = require("morgan");
const compression = require("compression");
const fileUpload = require("express-fileupload"); // ADD THIS

const connectDB = require("./config/database");

dotenv.config();

// ==========================
// Connect Database
// ==========================
connectDB();

// ==========================
// Rate Limiter - Increased limit for development
// ==========================
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: {
        success: false,
        message: "Too many requests. Please try again later."
    }
});

const app = express();

// ==========================
// Middleware
// ==========================
app.use(morgan("dev"));
app.use(limiter);
app.use(express.json({ limit: '50mb' })); // ADDED limit
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // ADDED limit
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(mongoSanitize());
app.use(hpp());
app.use(compression());

// ==========================
// File Upload Middleware - ADD THIS
// ==========================
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    abortOnLimit: true,
    responseOnLimit: 'File size exceeds 5MB limit',
    createParentPath: true
}));

// ==========================
// CORS Configuration
// ==========================
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    process.env.FRONTEND_URL,
    "https://smart-grid-nashik.onrender.com",
].filter(Boolean);

const uniqueOrigins = [...new Set(allowedOrigins)];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) {
            return callback(null, true);
        }

        if (uniqueOrigins.includes(origin)) {
            return callback(null, true);
        }

        if (process.env.NODE_ENV !== "production") {
            console.warn(`⚠️ CORS: Allowing development origin: ${origin}`);
            return callback(null, true);
        }

        const errorMsg = `CORS policy: '${origin}' is not allowed to access this server.`;
        console.warn(errorMsg);
        callback(new Error(errorMsg));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    maxAge: 86400,
};

app.use(cors(corsOptions));

// ==========================
// Upload Folder
// ==========================
const uploadPath = path.join(__dirname, "uploads");
const imagesPath = path.join(uploadPath, "images");

// Create both directories
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}
if (!fs.existsSync(imagesPath)) {
    fs.mkdirSync(imagesPath, { recursive: true });
}

// Serve static files
app.use("/uploads", express.static(uploadPath));

// ==========================
// Routes
// ==========================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/technician", require("./routes/technicianRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

// ==========================
// Root Route
// ==========================
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "⚡ Smart Grid Nashik Backend Running",
    });
});

// ==========================
// Health Check
// ==========================
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        database: "Connected",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
    });
});

// ==========================
// Test Route
// ==========================
app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "Backend API Working Successfully 🚀",
    });
});

// ==========================
// 404 Route
// ==========================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
    });
});

// ==========================
// Global Error Handler
// ==========================
app.use((err, req, res, next) => {
    console.error("❌ Error:", err);

    // Handle file upload errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
            success: false,
            message: 'File too large. Maximum size is 5MB'
        });
    }

    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ==========================
// Start Server
// ==========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("======================================");
    console.log("🚀 Smart Grid Nashik Backend Started");
    console.log(`📍 Server : http://localhost:${PORT}`);
    console.log(`❤️ Health : http://localhost:${PORT}/api/health`);
    console.log(`🧪 Test   : http://localhost:${PORT}/api/test`);
    console.log(`📁 Uploads: ${uploadPath}`);
    console.log("======================================");
});

module.exports = app;