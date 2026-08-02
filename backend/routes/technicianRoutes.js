const express = require("express");

const router = express.Router();

const technicianController = require("../controllers/technicianController");

const {
    protect,
    authorize,
} = require("../middleware/auth");

router.get(
    "/stats",
    protect,
    authorize("technician"),
    technicianController.getDashboardStats
);

router.get(
    "/complaints",
    protect,
    authorize("technician"),
    technicianController.getComplaints
);

router.put(
    "/accept/:id",
    protect,
    authorize("technician"),
    technicianController.acceptComplaint
);

router.put(
    "/complete/:id",
    protect,
    authorize("technician"),
    technicianController.completeComplaint
);

router.get(
    "/profile",
    protect,
    authorize("technician"),
    technicianController.getProfile
);

router.get(
    "/complaint/:id",
    protect,
    authorize("technician"),
    technicianController.getComplaintById
);

router.put(
    "/profile",
    protect,
    authorize("technician"),
    technicianController.updateProfile
);

router.get(
    "/history",
    protect,
    authorize("technician"),
    technicianController.getComplaintHistory
);

router.get(
    "/analytics",
    protect,
    authorize("technician"),
    technicianController.getAnalytics
);

module.exports = router;
