const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Technician = require('../models/Technician');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const NotificationService = require('../services/notificationService');

// Verify Admin Token Middleware
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    req.adminId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// ==================== DASHBOARD STATS ====================
router.get('/stats', verifyAdmin, async (req, res) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({ status: 'Pending' });
    const assignedComplaints = await Complaint.countDocuments({ status: 'Assigned' });
    const inProgressComplaints = await Complaint.countDocuments({ status: 'InProgress' });
    const completedComplaints = await Complaint.countDocuments({ status: 'Completed' });
    const totalTechnicians = await Technician.countDocuments();
    const totalUsers = await User.countDocuments();
    
    res.json({
      totalComplaints,
      pendingComplaints,
      assignedComplaints,
      inProgressComplaints,
      completedComplaints,
      totalTechnicians,
      totalUsers,
      resolutionRate: totalComplaints > 0 ? Math.round((completedComplaints / totalComplaints) * 100) : 0
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: error.message });
  }
});

// ==================== COMPLAINTS MANAGEMENT ====================
// Get all complaints
router.get('/complaints', verifyAdmin, async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('userId', 'name email mobile area address')
      .populate('assignedTechnicianId', 'name contactNumber email location')
      .sort({ submittedAt: -1 });
    res.json(complaints);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get single complaint by ID
router.get('/complaint/:id', verifyAdmin, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('userId', 'name email mobile area address')
      .populate('assignedTechnicianId', 'name contactNumber email location');
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    res.json(complaint);
  } catch (error) {
    console.error('Error fetching complaint:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get recent complaints (last 5)
router.get('/complaints/recent', verifyAdmin, async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('userId', 'name area')
      .sort({ submittedAt: -1 })
      .limit(5);
    res.json(complaints);
  } catch (error) {
    console.error('Error fetching recent complaints:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get complaints by area for chart
router.get('/complaints/by-area', verifyAdmin, async (req, res) => {
  try {
    const areaData = await Complaint.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: '$user.area',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    const formattedData = areaData.map(item => ({
      area: item._id || 'Unknown',
      count: item.count
    }));
    
    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching area data:', error);
    res.json([]);
  }
});

// Get monthly complaints data for chart
router.get('/complaints/monthly', verifyAdmin, async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    
    const monthlyData = await Complaint.aggregate([
      { $match: { submittedAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$submittedAt' },
            month: { $month: '$submittedAt' }
          },
          complaints: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedData = monthlyData.map(item => ({
      month: monthNames[item._id.month - 1],
      complaints: item.complaints,
      resolved: item.resolved
    }));
    
    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching monthly data:', error);
    res.json([]);
  }
});

// ==================== TECHNICIAN ASSIGNMENT ====================
// Assign technician to complaint (SINGLE VERSION - no duplicate)
router.post('/assign', verifyAdmin, async (req, res) => {
  try {
    const { complaintId, technicianId } = req.body;
    
    // Get complaint with user details
    const complaint = await Complaint.findById(complaintId).populate('userId', 'name email');
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    const technician = await Technician.findById(technicianId);
    if (!technician) {
      return res.status(404).json({ message: 'Technician not found' });
    }
    
    const oldStatus = complaint.status;
    complaint.assignedTechnicianId = technicianId;
    complaint.status = 'Assigned';
    complaint.assignedAt = new Date();
    await complaint.save();
    
    // Trigger notifications (don't await to avoid blocking)
    if (complaint.userId && complaint.userId.email) {
      NotificationService.notifyStatusChange(
        complaint, 
        oldStatus, 
        'Assigned', 
        complaint.userId.name, 
        complaint.userId.email
      ).catch(err => console.error('Notification error:', err));
    }
    
    NotificationService.notifyTechnicianAssigned(
      complaint, 
      technicianId, 
      technician.name, 
      technician.email
    ).catch(err => console.error('Notification error:', err));
    
    res.json({ 
      message: 'Technician assigned successfully', 
      complaint: {
        id: complaint._id,
        status: complaint.status,
        technician: technician.name
      }
    });
  } catch (error) {
    console.error('Error assigning technician:', error);
    res.status(500).json({ message: error.message });
  }
});

// ==================== TECHNICIAN MANAGEMENT ====================
// Get all technicians
router.get('/technicians', verifyAdmin, async (req, res) => {
  try {
    const technicians = await Technician.find().select('-password').sort({ createdAt: -1 });
    res.json(technicians);
  } catch (error) {
    console.error('Error fetching technicians:', error);
    res.status(500).json({ message: error.message });
  }
});

// Register new technician
router.post('/technician', verifyAdmin, async (req, res) => {
  try {
    const { name, education, experience, contactNumber, email, location, password } = req.body;
    
    // Check if technician already exists
    const existingTechnician = await Technician.findOne({ 
      $or: [{ email }, { contactNumber }] 
    });
    
    if (existingTechnician) {
      return res.status(400).json({ 
        message: 'Technician already exists with this email or contact number' 
      });
    }
    
    const technician = new Technician({
      name,
      education: education || '',
      experience: experience || '',
      contactNumber,
      email,
      location,
      password
    });
    
    await technician.save();
    
    res.status(201).json({ 
      message: 'Technician registered successfully', 
      technician: {
        id: technician._id,
        name: technician.name,
        email: technician.email,
        contactNumber: technician.contactNumber,
        location: technician.location
      }
    });
  } catch (error) {
    console.error('Error creating technician:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete technician
router.delete('/technician/:id', verifyAdmin, async (req, res) => {
  try {
    const technician = await Technician.findByIdAndDelete(req.params.id);
    if (!technician) {
      return res.status(404).json({ message: 'Technician not found' });
    }
    res.json({ message: 'Technician deleted successfully' });
  } catch (error) {
    console.error('Error deleting technician:', error);
    res.status(500).json({ message: error.message });
  }
});

// ==================== REPORT ENDPOINTS ====================
router.get('/reports/complaints-by-area', verifyAdmin, async (req, res) => {
  try {
    const areaData = await Complaint.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: '$user.area',
          count: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    res.json(areaData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/reports/resolve-vs-pending', verifyAdmin, async (req, res) => {
  try {
    const total = await Complaint.countDocuments();
    const resolved = await Complaint.countDocuments({ status: 'Completed' });
    const pending = total - resolved;
    
    res.json({ total, resolved, pending, resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/reports/monthly', verifyAdmin, async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    
    const monthlyData = await Complaint.aggregate([
      { $match: { submittedAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$submittedAt' },
            month: { $month: '$submittedAt' }
          },
          total: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedData = monthlyData.map(item => ({
      month: monthNames[item._id.month - 1],
      total: item.total,
      resolved: item.resolved
    }));
    
    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;