const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");

const { protect, authorize } = require("../middleware/auth");

const {
    technicianValidation,
    objectIdValidation
} = require("../middleware/validation");

router.get(
    "/stats",
    protect,
    authorize("admin"),
    adminController.getDashboardStats
);

router.get(
    "/complaints/recent",
    protect,
    authorize("admin"),
    adminController.getRecentComplaints
);

router.get(
    "/complaints/by-area",
    protect,
    authorize("admin"),
    adminController.getComplaintByArea
);

router.get(
    "/complaints/monthly",
    protect,
    authorize("admin"),
    adminController.getMonthlyComplaints
);

router.get(
"/complaints",
protect,
authorize("admin"),
adminController.getAllComplaints
);

router.get(
"/complaint/:id",
protect,
authorize("admin"),
objectIdValidation,
adminController.getComplaintById
);

router.post(
"/assign",
protect,
authorize("admin"),
adminController.assignTechnician
);

router.put(
"/complaint/:id",
protect,
authorize("admin"),
objectIdValidation,
adminController.updateComplaintStatus
);

router.get(
    "/technicians",
    protect,
    authorize("admin"),
    adminController.getAllTechnicians
);

router.get(
    "/technician/:id",
    protect,
    authorize("admin"),
    objectIdValidation,
    adminController.getTechnicianById
);

router.post(
"/technician",
protect,
authorize("admin"),
technicianValidation,
adminController.createTechnician
);

router.put(
    "/technician/:id",
    protect,
    authorize("admin"),
    objectIdValidation,
    adminController.updateTechnician
);

router.delete(
    "/technician/:id",
    protect,
    authorize("admin"),
    objectIdValidation,
    adminController.deleteTechnician
);

router.get(
    "/reports/complaints-by-area",
    protect,
    authorize("admin"),
    adminController.getComplaintAreaReport
);

router.get(
    "/reports/resolve-vs-pending",
    protect,
    authorize("admin"),
    adminController.getResolutionReport
);

router.get(
    "/reports/monthly",
    protect,
    authorize("admin"),
    adminController.getMonthlyReport
);

module.exports = router;