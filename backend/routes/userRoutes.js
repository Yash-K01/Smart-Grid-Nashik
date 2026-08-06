const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/auth");
const uploadFile = require("../middleware/upload"); // Import the express-fileupload middleware

const userController = require("../controllers/userController");

// ===================================
// Profile
// ===================================
router.get(
    "/profile",
    protect,
    authorize("user"),
    userController.getProfile
);

router.put(
    "/profile",
    protect,
    authorize("user"),
    userController.updateProfile
);

// ===================================
// Complaint
// ===================================
router.post(
    "/complaint",
    protect,
    authorize("user"),
    uploadFile, // Use express-fileupload middleware
    userController.createComplaint
);

router.get(
    "/complaints",
    protect,
    authorize("user"),
    userController.getComplaints
);

router.get(
    "/complaint/:id",
    protect,
    authorize("user"),
    userController.getComplaintById
);

router.delete(
    "/complaint/:id",
    protect,
    authorize("user"),
    userController.cancelComplaint
);

// ===================================
// Dashboard
// ===================================
router.get(
    "/stats",
    protect,
    authorize("user"),
    userController.getDashboardStats
);

// ===================================
// Notifications
// ===================================
router.get(
    "/notifications",
    protect,
    authorize("user"),
    userController.getNotifications
);

router.put(
    "/notification/:id/read",
    protect,
    authorize("user"),
    userController.markNotificationRead
);

router.delete(
    "/notification/:id",
    protect,
    authorize("user"),
    userController.deleteNotification
);

// ===================================
// Search
// ===================================
router.get(
    "/search",
    protect,
    authorize("user"),
    userController.searchComplaints
);

module.exports = router;