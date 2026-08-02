const User = require("../models/User");
const Complaint = require("../models/Complaint");
const NotificationService = require("../services/notificationService");

exports.getProfile = async (req, res) => {

    try {

        const user = await User.findById(req.user.id)
            .select("-password");

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        res.json({

            success: true,

            data: user

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

        const user = await User.findById(req.user.id);

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        user.name = req.body.name || user.name;
        user.mobile = req.body.mobile || user.mobile;
        user.address = req.body.address || user.address;
        user.area = req.body.area || user.area;

        await user.save();

        res.json({

            success: true,

            message: "Profile updated successfully",

            data: user

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

exports.createComplaint = async (req, res) => {

    try {

        const {

            title,

            description,

            category

        } = req.body;

        const complaint = await Complaint.create({

            userId: req.user.id,

            title,

            description,

            category,

            image: req.file ? req.file.filename : null,

            status: "Pending"

        });

        res.status(201).json({

            success: true,

            message: "Complaint submitted successfully.",

            data: complaint

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

exports.getComplaints = async (req, res) => {

    try {

        const complaints = await Complaint.find({

            userId: req.user.id

        })

        .populate("assignedTechnicianId","name contactNumber")

        .sort({

            submittedAt:-1

        });

        res.json({

            success:true,

            count:complaints.length,

            data:complaints

        });

    } catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};

exports.getComplaintById = async (req,res)=>{

try{

const complaint=await Complaint.findById(req.params.id)

.populate("assignedTechnicianId","name contactNumber email");

if(!complaint){

return res.status(404).json({

success:false,

message:"Complaint not found"

});

}

if(complaint.userId.toString()!=req.user.id){

return res.status(403).json({

success:false,

message:"Unauthorized"

});

}

res.json({

success:true,

data:complaint

});

}catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};

exports.getDashboardStats = async (req,res)=>{

try{

const total=await Complaint.countDocuments({

userId:req.user.id

});

const pending=await Complaint.countDocuments({

userId:req.user.id,

status:"Pending"

});

const assigned=await Complaint.countDocuments({

userId:req.user.id,

status:"Assigned"

});

const progress=await Complaint.countDocuments({

userId:req.user.id,

status:"InProgress"

});

const completed=await Complaint.countDocuments({

userId:req.user.id,

status:"Completed"

});

res.json({

success:true,

data:{

total,

pending,

assigned,

progress,

completed

}

});

}catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};

exports.cancelComplaint = async (req, res) => {

    try {

        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found"
            });
        }

        if (complaint.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            });
        }

        if (complaint.status !== "Pending") {
            return res.status(400).json({
                success: false,
                message: "Complaint cannot be cancelled after assignment."
            });
        }

        await complaint.deleteOne();

        res.json({
            success: true,
            message: "Complaint cancelled successfully."
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

const Notification = require("../models/Notification");

exports.getNotifications = async (req, res) => {

    try {

        const notifications = await Notification.find({
            userId: req.user.id
        }).sort({ createdAt: -1 });

        res.json({
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

exports.markNotificationRead = async (req, res) => {

    try {

        const notification = await Notification.findById(req.params.id);

        if (!notification) {

            return res.status(404).json({
                success: false,
                message: "Notification not found"
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

exports.deleteNotification = async (req, res) => {

    try {

        const notification = await Notification.findById(req.params.id);

        if (!notification) {

            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });

        }

        await notification.deleteOne();

        res.json({

            success: true,

            message: "Notification deleted."

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

exports.searchComplaints = async (req, res) => {

    try {

        const keyword = req.query.search || "";

        const complaints = await Complaint.find({

            userId: req.user.id,

            title: {

                $regex: keyword,

                $options: "i"

            }

        });

        res.json({

            success: true,

            data: complaints

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};