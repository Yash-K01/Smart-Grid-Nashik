const nodemailer = require("nodemailer");

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }

    // ==========================================
    // Generic Email Sender
    // ==========================================
    async sendEmail({
        to,
        subject,
        text,
        html = null,
    }) {
        try {
            const mailOptions = {
                from: `"Smart Grid Nashik" <${process.env.EMAIL_USER}>`,
                to,
                subject,
                text,
                html,
            };

            const info = await this.transporter.sendMail(mailOptions);

            console.log(`📧 Email sent: ${info.messageId}`);

            return info;
        } catch (error) {
            console.error("Email Error:", error.message);
            throw error;
        }
    }

    // ==========================================
    // Welcome Email
    // ==========================================
    async sendWelcomeEmail(user) {
        return this.sendEmail({
            to: user.email,
            subject: "Welcome to Smart Grid Nashik",
            text: `Hello ${user.name},

Welcome to Smart Grid Nashik.

Your account has been created successfully.

Thank you.
Smart Grid Nashik Team`,
        });
    }

    // ==========================================
    // Complaint Registered
    // ==========================================
    async sendComplaintRegistered(user, complaint) {
        return this.sendEmail({
            to: user.email,
            subject: "Complaint Registered Successfully",
            text: `Hello ${user.name},

Your complaint has been registered successfully.

Complaint ID : ${complaint._id}

Status : Pending

Thank you.`,
        });
    }

    // ==========================================
    // Technician Assigned
    // ==========================================
    async sendTechnicianAssigned(user, complaint, technician) {
        return this.sendEmail({
            to: user.email,
            subject: "Technician Assigned",
            text: `Hello ${user.name},

A technician has been assigned to your complaint.

Technician : ${technician.name}

Complaint ID : ${complaint._id}

Status : Assigned`,
        });
    }

    // ==========================================
    // Complaint Completed
    // ==========================================
    async sendComplaintCompleted(user, complaint) {
        return this.sendEmail({
            to: user.email,
            subject: "Complaint Resolved",
            text: `Hello ${user.name},

Your complaint has been resolved successfully.

Complaint ID : ${complaint._id}

Thank you for using Smart Grid Nashik.`,
        });
    }

    // ==========================================
    // Custom Email
    // ==========================================
    async sendCustomEmail({
        to,
        subject,
        message,
    }) {
        return this.sendEmail({
            to,
            subject,
            text: message,
        });
    }
}

module.exports = new EmailService();