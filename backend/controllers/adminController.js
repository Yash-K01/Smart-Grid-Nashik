const Complaint = require("../models/Complaint");
const User = require("../models/User");
const Technician = require("../models/Technician");
const NotificationService = require("../services/notificationService");

exports.getDashboardStats = async (req, res) => {
    try {

        const totalComplaints = await Complaint.countDocuments();

        const pending = await Complaint.countDocuments({
            status: "Pending",
        });

        const assigned = await Complaint.countDocuments({
            status: "Assigned",
        });

        const inProgress = await Complaint.countDocuments({
            status: "InProgress",
        });

        const completed = await Complaint.countDocuments({
            status: "Completed",
        });

        const technicians = await Technician.countDocuments();

        const users = await User.countDocuments();

        res.status(200).json({
            success: true,
            data: {
                totalComplaints,
                pending,
                assigned,
                inProgress,
                completed,
                technicians,
                users,
            },
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

exports.getRecentComplaints = async (req, res) => {

    try {

        const complaints = await Complaint.find()

            .populate("userId", "name area")

            .sort({ submittedAt: -1 })

            .limit(5);

        res.status(200).json({

            success: true,

            data: complaints,

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message,

        });

    }

};

exports.getComplaintByArea = async (req, res) => {

    try {

        const areaData = await Complaint.aggregate([

            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user",
                },
            },

            { $unwind: "$user" },

            {
                $group: {
                    _id: "$user.area",
                    count: {
                        $sum: 1,
                    },
                },
            },

            {
                $sort: {
                    count: -1,
                },
            },

            {
                $limit: 5,
            },

        ]);

        const data = areaData.map((item) => ({

            area: item._id || "Unknown",

            count: item.count,

        }));

        res.status(200).json({

            success: true,

            data,

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message,

        });

    }

};

exports.getMonthlyComplaints = async (req, res) => {

    try {

        const sixMonthsAgo = new Date();

        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);

        const monthlyData = await Complaint.aggregate([

            {
                $match: {
                    submittedAt: {
                        $gte: sixMonthsAgo,
                    },
                },
            },

            {
                $group: {

                    _id: {

                        year: {
                            $year: "$submittedAt",
                        },

                        month: {
                            $month: "$submittedAt",
                        },

                    },

                    complaints: {
                        $sum: 1,
                    },

                    resolved: {

                        $sum: {

                            $cond: [

                                {
                                    $eq: ["$status", "Completed"],
                                },

                                1,

                                0,

                            ],

                        },

                    },

                },

            },

            {

                $sort: {

                    "_id.year": 1,

                    "_id.month": 1,

                },

            },

        ]);

        const months = [

            "Jan",

            "Feb",

            "Mar",

            "Apr",

            "May",

            "Jun",

            "Jul",

            "Aug",

            "Sep",

            "Oct",

            "Nov",

            "Dec",

        ];

        const result = monthlyData.map((item) => ({

            month: months[item._id.month - 1],

            complaints: item.complaints,

            resolved: item.resolved,

        }));

        res.status(200).json({

            success: true,

            data: result,

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message,

        });

    }

};

exports.getAllComplaints = async (req, res) => {
    try {

        const complaints = await Complaint.find()
            .populate("userId", "name email mobile area")
            .populate("assignedTechnicianId", "name email contactNumber")
            .sort({ submittedAt: -1 });

        res.status(200).json({
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

exports.getComplaintById = async (req, res) => {

    try {

        const complaint = await Complaint.findById(req.params.id)
            .populate("userId")
            .populate("assignedTechnicianId");

        if (!complaint) {
            return res.status(404).json({
                success:false,
                message:"Complaint not found"
            });
        }

        res.json({
            success:true,
            data:complaint
        });

    } catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};

exports.assignTechnician = async (req,res)=>{

try{

const {complaintId,technicianId}=req.body;

const complaint=await Complaint.findById(complaintId)
.populate("userId","name email");

if(!complaint){

return res.status(404).json({
success:false,
message:"Complaint not found"
});

}

const technician=await Technician.findById(technicianId);

if(!technician){

return res.status(404).json({
success:false,
message:"Technician not found"
});

}

const oldStatus=complaint.status;

complaint.assignedTechnicianId=technician._id;

complaint.status="Assigned";

complaint.assignedAt=new Date();

await complaint.save();

await NotificationService.notifyStatusChange(

complaint,

oldStatus,

"Assigned",

complaint.userId.name,

complaint.userId.email

);

await NotificationService.notifyTechnicianAssigned(

complaint,

technician._id,

technician.name,

technician.email

);

res.json({

success:true,

message:"Technician assigned successfully",

data:complaint

});

}catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};

exports.updateComplaintStatus=async(req,res)=>{

try{

const complaint=await Complaint.findById(req.params.id);

if(!complaint){

return res.status(404).json({

success:false,

message:"Complaint not found"

});

}

complaint.status=req.body.status;

await complaint.save();

res.json({

success:true,

message:"Complaint updated successfully",

data:complaint

});

}catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};

exports.getAllTechnicians = async (req, res) => {
    try {

        const technicians = await Technician.find()
            .select("-password")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: technicians.length,
            data: technicians
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

exports.getTechnicianById = async (req, res) => {

    try {

        const technician = await Technician.findById(req.params.id)
            .select("-password");

        if (!technician) {

            return res.status(404).json({
                success: false,
                message: "Technician not found"
            });

        }

        res.json({
            success: true,
            data: technician
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

exports.createTechnician = async (req, res) => {

    try {

        const {
            name,
            education,
            experience,
            contactNumber,
            email,
            location,
            password
        } = req.body;

        const existing = await Technician.findOne({
            $or: [
                { email },
                { contactNumber }
            ]
        });

        if (existing) {

            return res.status(400).json({
                success: false,
                message: "Technician already exists"
            });

        }

        const technician = await Technician.create({

            name,

            education,

            experience,

            contactNumber,

            email,

            location,

            password

        });

        res.status(201).json({

            success: true,

            message: "Technician created successfully",

            data: {

                id: technician._id,

                name: technician.name,

                email: technician.email,

                contactNumber: technician.contactNumber,

                location: technician.location

            }

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

exports.updateTechnician = async (req, res) => {

    try {

        const technician = await Technician.findById(req.params.id);

        if (!technician) {

            return res.status(404).json({

                success: false,

                message: "Technician not found"

            });

        }

        Object.assign(technician, req.body);

        await technician.save();

        res.json({

            success: true,

            message: "Technician updated successfully",

            data: technician

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

exports.deleteTechnician = async (req, res) => {

    try {

        const technician = await Technician.findById(req.params.id);

        if (!technician) {

            return res.status(404).json({

                success: false,

                message: "Technician not found"

            });

        }

        await technician.deleteOne();

        res.json({

            success: true,

            message: "Technician deleted successfully"

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

exports.getComplaintAreaReport = async (req, res) => {

    try {

        const report = await Complaint.aggregate([

            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },

            {
                $unwind: "$user"
            },

            {
                $group: {
                    _id: "$user.area",

                    total: {
                        $sum: 1
                    },

                    resolved: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: ["$status", "Completed"]
                                },
                                1,
                                0
                            ]
                        }
                    },

                    pending: {
                        $sum: {
                            $cond: [
                                {
                                    $ne: ["$status", "Completed"]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },

            {
                $sort: {
                    total: -1
                }
            }

        ]);

        res.status(200).json({
            success: true,
            data: report
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

exports.getResolutionReport = async (req, res) => {

    try {

        const total = await Complaint.countDocuments();

        const completed = await Complaint.countDocuments({
            status: "Completed"
        });

        const pending = total - completed;

        const inProgress = await Complaint.countDocuments({
            status: "InProgress"
        });

        const assigned = await Complaint.countDocuments({
            status: "Assigned"
        });

        res.json({

            success: true,

            data: {

                total,

                completed,

                pending,

                assigned,

                inProgress,

                resolutionRate:
                    total === 0
                        ? 0
                        : Number(((completed / total) * 100).toFixed(2))

            }

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

exports.getMonthlyReport = async (req, res) => {

    try {

        const sixMonthsAgo = new Date();

        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);

        const report = await Complaint.aggregate([

            {
                $match: {
                    submittedAt: {
                        $gte: sixMonthsAgo
                    }
                }
            },

            {
                $group: {

                    _id: {

                        year: {
                            $year: "$submittedAt"
                        },

                        month: {
                            $month: "$submittedAt"
                        }

                    },

                    total: {
                        $sum: 1
                    },

                    completed: {

                        $sum: {

                            $cond: [

                                {
                                    $eq: [
                                        "$status",
                                        "Completed"
                                    ]
                                },

                                1,

                                0

                            ]

                        }

                    }

                }

            },

            {

                $sort: {

                    "_id.year": 1,

                    "_id.month": 1

                }

            }

        ]);

        const monthNames = [

            "Jan",

            "Feb",

            "Mar",

            "Apr",

            "May",

            "Jun",

            "Jul",

            "Aug",

            "Sep",

            "Oct",

            "Nov",

            "Dec"

        ];

        const formatted = report.map(item => ({

            month: monthNames[item._id.month - 1],

            total: item.total,

            completed: item.completed

        }));

        res.json({

            success: true,

            data: formatted

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};