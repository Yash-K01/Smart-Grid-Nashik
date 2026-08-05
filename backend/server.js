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

const connectDB = require("./config/database");

dotenv.config();

// ==========================
// Connect Database
// ==========================
connectDB();

const limiter = rateLimit({

    windowMs: 15 * 60 * 1000,

    max: 100,

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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(mongoSanitize());
app.use(hpp());
app.use(compression());

// ==========================
// CORS Configuration
// ==========================
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.FRONTEND_URL,
  "https://smart-grid-nashik.onrender.com", // Production frontend
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Allow requests with no origin (like mobile apps or server requests)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Reject requests from disallowed origins
    const errorMsg = `CORS policy: '${origin}' is not allowed to access this server.`;
    console.warn(errorMsg);
    
    if (process.env.NODE_ENV === "production") {
      callback(new Error(errorMsg));
    } else {
      // In development, allow with warning
      callback(null, true);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));

// ==========================
// Upload Folder
// ==========================
const uploadPath = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

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
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
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
  console.log("======================================");
});

module.exports = app;
