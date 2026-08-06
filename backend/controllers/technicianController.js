const Complaint = require("../models/Complaint");
const Technician = require("../models/Technician");
const NotificationService = require("../services/notificationService");

exports.getDashboardStats = async (req, res) => {
    try {
        const technicianId = req.user.id;

        const assigned = await Complaint.countDocuments({
            assignedTechnicianId: technicianId,
            status: "Assigned",
        });

        const inProgress = await Complaint.countDocuments({
            assignedTechnicianId: technicianId,
            status: "InProgress",
        });

        const completed = await Complaint.countDocuments({
            assignedTechnicianId: technicianId,
            status: "Completed",
        });

        res.json({
            success: true,
            data: {
                assigned,
                inProgress,
                completed,
                total: assigned + inProgress + completed,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({
            assignedTechnicianId: req.user.id,
        })
            .populate("userId", "name email mobile area address")
            .sort({
                submittedAt: -1,
            });

        res.json({
            success: true,
            count: complaints.length,
            data: complaints,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.acceptComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id)
            .populate("userId", "name email");

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found",
            });
        }

        if (complaint.assignedTechnicianId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const oldStatus = complaint.status;

        complaint.status = "InProgress";
        complaint.startedAt = new Date();

        await complaint.save();

        await NotificationService.notifyStatusChange(
            complaint,
            oldStatus,
            "InProgress",
            complaint.userId.name,
            complaint.userId.email
        );

        res.json({
            success: true,
            message: "Complaint accepted.",
            data: complaint,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ===========================
// FIXED: Complete Complaint
// ===========================
exports.completeComplaint = async (req, res) => {
    console.log('📝 Complete Complaint Request:');
    console.log('📌 Complaint ID:', req.params.id);
    console.log('📌 Remarks:', req.body.remarks);
    console.log('👤 Technician ID:', req.user.id);

    try {
        const { remarks } = req.body;
        const complaintId = req.params.id;

        // Validate remarks
        if (!remarks || remarks.trim() === '') {
            return res.status(400).json({
                success: false,
                message: "Completion remarks are required",
            });
        }

        // Find complaint
        const complaint = await Complaint.findById(complaintId)
            .populate("userId", "name email mobile");

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found",
            });
        }

        // Check if complaint is assigned to this technician
        if (!complaint.assignedTechnicianId) {
            return res.status(400).json({
                success: false,
                message: "No technician assigned to this complaint",
            });
        }

        if (complaint.assignedTechnicianId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized - This complaint is not assigned to you",
            });
        }

        // Check if already completed
        if (complaint.status === "Completed") {
            return res.status(400).json({
                success: false,
                message: "This complaint is already completed",
            });
        }

        // Update complaint
        complaint.status = "Completed";
        complaint.completedAt = new Date();
        complaint.remarks = remarks.trim();

        await complaint.save();
        console.log('✅ Complaint completed:', complaint._id);

        // Update technician's assigned complaints count
        try {
            await Technician.findByIdAndUpdate(req.user.id, {
                $inc: { assignedComplaints: -1 }
            });
            console.log('✅ Technician count updated');
        } catch (error) {
            console.warn('⚠️ Could not update technician count:', error);
        }

        // Send notification to user
        try {
            await NotificationService.notifyWorkCompleted(
                complaint,
                complaint.userId.name,
                complaint.userId.email,
                remarks
            );
            console.log('✅ Notification sent');
        } catch (error) {
            console.warn('⚠️ Could not send notification:', error);
        }

        res.json({
            success: true,
            message: "Complaint completed successfully.",
            data: complaint,
        });
    } catch (error) {
        console.error('❌ Error completing complaint:', error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to complete complaint",
        });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const technician = await Technician.findById(req.user.id).select("-password");

        res.json({
            success: true,
            data: technician,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getComplaintById = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id)
            .populate("userId", "name email mobile area address");

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found"
            });
        }

        if (complaint.assignedTechnicianId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            });
        }

        res.json({
            success: true,
            data: complaint
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const technician = await Technician.findById(req.user.id);

        if (!technician) {
            return res.status(404).json({
                success: false,
                message: "Technician not found"
            });
        }

        technician.name = req.body.name || technician.name;
        technician.contactNumber = req.body.contactNumber || technician.contactNumber;
        technician.location = req.body.location || technician.location;
        technician.education = req.body.education || technician.education;
        technician.experience = req.body.experience || technician.experience;

        await technician.save();

        res.json({
            success: true,
            message: "Profile updated successfully",
            data: technician
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getComplaintHistory = async (req, res) => {
    try {
        const complaints = await Complaint.find({
            assignedTechnicianId: req.user.id,
            status: "Completed"
        })
            .populate("userId", "name area")
            .sort({
                completedAt: -1
            });

        res.json({
            success: true,
            count: complaints.length,
            data: complaints
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getAnalytics = async (req, res) => {
    try {
        const technicianId = req.user.id;

        const monthlyCompleted = await Complaint.aggregate([
            {
                $match: {
                    assignedTechnicianId: technicianId,
                    status: "Completed"
                }
            },
            {
                $group: {
                    _id: {
                        month: {
                            $month: "$completedAt"
                        }
                    },
                    total: {
                        $sum: 1
                    }
                }
            },
            {
                $sort: {
                    "_id.month": 1
                }
            }
        ]);

        res.json({
            success: true,
            data: monthlyCompleted
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.rejectComplaint = async (req, res) => {
    try {
        const { reason } = req.body;
        const complaint = await Complaint.findById(req.params.id)
            .populate("userId", "name email");

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found",
            });
        }

        if (complaint.assignedTechnicianId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized",
            });
        }

        if (complaint.status !== "Assigned") {
            return res.status(400).json({
                success: false,
                message: "Complaint is not in assigned status",
            });
        }

        complaint.status = "Rejected";
        complaint.remarks = reason || "Rejected by technician";
        complaint.assignedTechnicianId = null;
        complaint.assignedAt = null;

        await complaint.save();

        // Update technician's assigned complaints count
        await Technician.findByIdAndUpdate(req.user.id, {
            $inc: { assignedComplaints: -1 }
        });

        await NotificationService.notifyWorkRejected(
            complaint,
            complaint.userId.name,
            complaint.userId.email,
            reason
        );

        res.json({
            success: true,
            message: "Complaint rejected",
            data: complaint,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};