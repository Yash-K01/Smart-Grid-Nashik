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
        complaintId = null
    }) {

        try {

            const notification = await Notification.create({

                recipientId,

                recipientType,

                title,

                message,

                complaintId

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

        complaintId = null

    }) {

        await this.createNotification({

            recipientId,

            recipientType,

            title,

            message,

            complaintId

        });

        await this.sendEmail(

            email,

            title,

            message

        );

    }

    // ==========================================
    // New Complaint
    // ==========================================
    async notifyNewComplaint(complaint, admin) {

        await this.notify({

            recipientId: admin._id,

            recipientType: "admin",

            email: admin.email,

            title: "New Complaint",

            message: `New complaint received from ${complaint.userName}.`,

            complaintId: complaint._id

        });

    }

    // ==========================================
    // Technician Assigned
    // ==========================================
    async notifyTechnicianAssigned(

        complaint,

        technician

    ) {

        await this.notify({

            recipientId: technician._id,

            recipientType: "technician",

            email: technician.email,

            title: "Complaint Assigned",

            message: `Complaint #${complaint._id} has been assigned to you.`,

            complaintId: complaint._id

        });

    }

    // ==========================================
    // User - Status Changed
    // ==========================================
    async notifyStatusChange(

        complaint,

        user

    ) {

        await this.notify({

            recipientId: user._id,

            recipientType: "user",

            email: user.email,

            title: "Complaint Status Updated",

            message: `Complaint status changed to ${complaint.status}.`,

            complaintId: complaint._id

        });

    }

    // ==========================================
    // Complaint Completed
    // ==========================================
    async notifyComplaintCompleted(

        complaint,

        user

    ) {

        await this.notify({

            recipientId: user._id,

            recipientType: "user",

            email: user.email,

            title: "Complaint Resolved",

            message: "Your complaint has been resolved successfully.",

            complaintId: complaint._id

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

        message

    }) {

        await this.notify({

            recipientId,

            recipientType,

            email,

            title,

            message

        });

    }

}

module.exports = new NotificationService();