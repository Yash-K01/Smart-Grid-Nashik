const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

const {
    complaintValidation,
    objectIdValidation
} = require("../middleware/validation");

const upload = require("../middleware/upload");

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
    upload.single("image"),
    complaintValidation,
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
    objectIdValidation,
    userController.getComplaintById
);

router.delete(
    "/complaint/:id",
    protect,
    authorize("user"),
    objectIdValidation,
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
    objectIdValidation,
    userController.markNotificationRead
);

router.delete(
    "/notification/:id",
    protect,
    authorize("user"),
    objectIdValidation,
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