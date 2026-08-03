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
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(mongoSanitize());
app.use(hpp());
app.use(compression());
// ==========================
// CORS
// ==========================
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn(`Blocked by CORS: ${origin}`);
      callback(null, true); // Change to callback(new Error(...)) in production
    },
    credentials: true,
  })
);

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
