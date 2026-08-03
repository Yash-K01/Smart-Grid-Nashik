const express = require("express");

const router = express.Router();

const technicianController = require("../controllers/technicianController");

const { protect, authorize } = require("../middleware/auth");

const {
    objectIdValidation
} = require("../middleware/validation");

// ===================================
// Dashboard
// ===================================
router.get(
    "/stats",
    protect,
    authorize("technician"),
    technicianController.getDashboardStats
);

// ===================================
// Complaints
// ===================================
router.get(
    "/complaints",
    protect,
    authorize("technician"),
    technicianController.getComplaints
);

router.get(
    "/complaint/:id",
    protect,
    authorize("technician"),
    objectIdValidation,
    technicianController.getComplaintById
);

router.put(
    "/accept/:id",
    protect,
    authorize("technician"),
    objectIdValidation,
    technicianController.acceptComplaint
);

router.put(
    "/complete/:id",
    protect,
    authorize("technician"),
    objectIdValidation,
    technicianController.completeComplaint
);

// ===================================
// Profile
// ===================================
router.get(
    "/profile",
    protect,
    authorize("technician"),
    technicianController.getProfile
);

router.put(
    "/profile",
    protect,
    authorize("technician"),
    technicianController.updateProfile
);

// ===================================
// History
// ===================================
router.get(
    "/history",
    protect,
    authorize("technician"),
    technicianController.getComplaintHistory
);

// ===================================
// Analytics
// ===================================
router.get(
    "/analytics",
    protect,
    authorize("technician"),
    technicianController.getAnalytics
);

module.exports = router;