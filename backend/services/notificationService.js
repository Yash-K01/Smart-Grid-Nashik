const Notification = require("../models/Notification");
const emailService = require("./emailService");

class NotificationService {

    // ==========================================
    // Create Notification
    // ==========================================
    async createNotification({
        recipientId,
        recipientType,
        title,
        message,
        complaintId = null,
        type = "GENERAL" // ADDED: For notification type
    }) {
        try {
            const notification = await Notification.create({
                recipientId,
                recipientType,
                title,
                message,
                complaintId,
                type: type, // ADDED: Store notification type
                isRead: false
            });
            return notification;
        } catch (error) {
            console.error("Notification Error:", error.message);
            return null;
        }
    }

    // ==========================================
    // Send Email
    // ==========================================
    async sendEmail(email, subject, message) {
        try {
            if (!email) return;
            await emailService.sendEmail({
                to: email,
                subject,
                text: message
            });
        } catch (error) {
            console.error("Email Error:", error.message);
        }
    }

    // ==========================================
    // Common Notification Method
    // ==========================================
    async notify({
        recipientId,
        recipientType,
        email,
        title,
        message,
        complaintId = null,
        type = "GENERAL" // ADDED
    }) {
        await this.createNotification({
            recipientId,
            recipientType,
            title,
            message,
            complaintId,
            type
        });

        await this.sendEmail(email, title, message);
    }

    // ==========================================
    // New Complaint
    // ==========================================
    async notifyNewComplaint(complaint, admin) {
        await this.notify({
            recipientId: admin._id,
            recipientType: "Admin", // FIXED: Should be "Admin" not "admin"
            email: admin.email,
            title: "New Complaint",
            message: `New ${complaint.complaintType} complaint received from ${complaint.userId?.name || 'User'}.`,
            complaintId: complaint._id,
            type: "NEW_COMPLAINT"
        });
    }

    // ==========================================
    // Technician Assigned
    // ==========================================
    async notifyTechnicianAssigned(complaint, technician) {
        await this.notify({
            recipientId: technician._id,
            recipientType: "Technician", // FIXED: Should be "Technician"
            email: technician.email,
            title: "Complaint Assigned",
            message: `Complaint #${complaint._id.toString().slice(-6)} - ${complaint.complaintType} has been assigned to you.`,
            complaintId: complaint._id,
            type: "ASSIGNED"
        });
    }

    // ==========================================
    // User - Status Changed
    // ==========================================
    async notifyStatusChange(complaint, oldStatus, newStatus, userName, userEmail) {
        await this.notify({
            recipientId: complaint.userId,
            recipientType: "User", // FIXED: Should be "User"
            email: userEmail,
            title: "Complaint Status Updated",
            message: `Your complaint "${complaint.complaintType}" status changed from ${oldStatus} to ${newStatus}.`,
            complaintId: complaint._id,
            type: "STATUS_UPDATED"
        });
    }

    // ==========================================
    // Complaint Completed
    // ==========================================
    async notifyComplaintCompleted(complaint, user) {
        await this.notify({
            recipientId: user._id,
            recipientType: "User",
            email: user.email,
            title: "Complaint Resolved",
            message: `Your complaint "${complaint.complaintType}" has been resolved successfully.`,
            complaintId: complaint._id,
            type: "COMPLETED"
        });
    }

    // ==========================================
    // Work Completed (New Method for Technician)
    // ==========================================
    async notifyWorkCompleted(complaint, userName, userEmail, remarks) {
        await this.notify({
            recipientId: complaint.userId,
            recipientType: "User",
            email: userEmail,
            title: "Complaint Resolved",
            message: `Your complaint "${complaint.complaintType}" has been resolved.${remarks ? ` Remarks: ${remarks}` : ''}`,
            complaintId: complaint._id,
            type: "COMPLETED"
        });
    }

    // ==========================================
    // Work Rejected (New Method for Technician)
    // ==========================================
    async notifyWorkRejected(complaint, userName, userEmail, reason) {
        await this.notify({
            recipientId: complaint.userId,
            recipientType: "User",
            email: userEmail,
            title: "Complaint Rejected",
            message: `Your complaint "${complaint.complaintType}" has been rejected by technician.${reason ? ` Reason: ${reason}` : ''}`,
            complaintId: complaint._id,
            type: "REJECTED"
        });
    }

    // ==========================================
    // Custom Notification
    // ==========================================
    async sendCustomNotification({
        recipientId,
        recipientType,
        email,
        title,
        message,
        complaintId = null,
        type = "GENERAL"
    }) {
        await this.notify({
            recipientId,
            recipientType,
            email,
            title,
            message,
            complaintId,
            type
        });
    }

    // ==========================================
    // Get User Notifications (New Method)
    // ==========================================
    async getUserNotifications(userId, userType) {
        try {
            return await Notification.find({
                recipientId: userId,
                recipientType: userType
            }).sort({ createdAt: -1 });
        } catch (error) {
            console.error("Error fetching notifications:", error);
            return [];
        }
    }

    // ==========================================
    // Get Unread Count (New Method)
    // ==========================================
    async getUnreadCount(userId, userType) {
        try {
            return await Notification.countDocuments({
                recipientId: userId,
                recipientType: userType,
                isRead: false
            });
        } catch (error) {
            console.error("Error getting unread count:", error);
            return 0;
        }
    }
}

module.exports = new NotificationService();