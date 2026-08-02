const express = require("express");

const router = express.Router();

const {
    protect
} = require("../middleware/auth");

const notificationController = require("../controllers/notificationController");

// ==================================
// Get All Notifications
// ==================================
router.get(
    "/",
    protect,
    notificationController.getNotifications
);

// ==================================
// Mark Notification Read
// ==================================
router.put(
    "/:id/read",
    protect,
    notificationController.markRead
);

// ==================================
// Delete Notification
// ==================================
router.delete(
    "/:id",
    protect,
    notificationController.deleteNotification
);

module.exports = router;