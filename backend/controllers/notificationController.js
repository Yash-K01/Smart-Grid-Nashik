const Notification = require("../models/Notification");

// =========================
// Get Notifications
// =========================
exports.getNotifications = async (req, res) => {
    try {

        const notifications = await Notification.find({
            recipientId: req.user.id,
            recipientType: req.user.role
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: notifications.length,
            data: notifications
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// =========================
// Mark Notification Read
// =========================
exports.markRead = async (req, res) => {

    try {

        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        if (
            notification.recipientId.toString() !== req.user.id ||
            notification.recipientType !== req.user.role
        ) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            });
        }

        notification.isRead = true;

        await notification.save();

        res.json({
            success: true,
            message: "Notification marked as read."
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// =========================
// Delete Notification
// =========================
exports.deleteNotification = async (req, res) => {

    try {

        const notification = await Notification.findById(req.params.id);

        if (!notification) {

            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });

        }

        if (
            notification.recipientId.toString() !== req.user.id ||
            notification.recipientType !== req.user.role
        ) {

            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            });

        }

        await notification.deleteOne();

        res.json({
            success: true,
            message: "Notification deleted successfully."
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};