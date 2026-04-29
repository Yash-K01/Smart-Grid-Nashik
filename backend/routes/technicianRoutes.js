const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Complaint = require('../models/Complaint');
const NotificationService = require('../services/notificationService');

// Verify Technician Token Middleware
const verifyTechnician = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'technician') {
      return res.status(403).json({ message: 'Technician access required' });
    }
    req.technicianId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// GET TECHNICIAN STATS
router.get('/stats', verifyTechnician, async (req, res) => {
  try {
    const assigned = await Complaint.countDocuments({ 
      assignedTechnicianId: req.technicianId, 
      status: 'Assigned' 
    });
    const inProgress = await Complaint.countDocuments({ 
      assignedTechnicianId: req.technicianId, 
      status: 'InProgress' 
    });
    const completed = await Complaint.countDocuments({ 
      assignedTechnicianId: req.technicianId, 
      status: 'Completed' 
    });
    const total = assigned + inProgress + completed;
    
    res.json({ assigned, inProgress, completed, total });
  } catch (error) {
    console.error('Error fetching technician stats:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET ALL COMPLAINTS FOR TECHNICIAN (INCLUDING COMPLETED)
router.get('/complaints', verifyTechnician, async (req, res) => {
  try {
    const complaints = await Complaint.find({ 
      assignedTechnicianId: req.technicianId
    })
      .populate('userId', 'name email mobile area address')
      .sort({ submittedAt: -1 });
    res.json(complaints);
  } catch (error) {
    console.error('Error fetching assigned complaints:', error);
    res.status(500).json({ message: error.message });
  }
});

// ACCEPT WORK (Status: Assigned -> InProgress) - WITH NOTIFICATION
router.put('/accept/:id', verifyTechnician, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('userId', 'name');
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    // Verify complaint is assigned to this technician
    if (complaint.assignedTechnicianId.toString() !== req.technicianId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const oldStatus = complaint.status;
    complaint.status = 'InProgress';
    complaint.startedAt = new Date();
    await complaint.save();
    
    // Trigger notification to user
    await NotificationService.notifyStatusChange(complaint, oldStatus, 'InProgress', complaint.userId?.name);
    
    res.json({ 
      message: 'Work accepted successfully', 
      complaint: { id: complaint._id, status: complaint.status }
    });
  } catch (error) {
    console.error('Error accepting work:', error);
    res.status(500).json({ message: error.message });
  }
});

// REJECT WORK (Status: Assigned -> Pending, remove technician) - WITH NOTIFICATION
router.put('/reject/:id', verifyTechnician, async (req, res) => {
  try {
    const { reason } = req.body;
    const complaint = await Complaint.findById(req.params.id)
      .populate('userId', 'name');
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    // Verify complaint is assigned to this technician
    if (complaint.assignedTechnicianId.toString() !== req.technicianId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const oldStatus = complaint.status;
    complaint.status = 'Pending';
    complaint.assignedTechnicianId = null;
    complaint.assignedAt = null;
    complaint.technicianRemarks = `Rejected by technician: ${reason}`;
    await complaint.save();
    
    // Trigger notification to user
    await NotificationService.notifyStatusChange(complaint, oldStatus, 'Rejected', complaint.userId?.name);
    
    res.json({ 
      message: 'Work rejected. Complaint sent back to admin', 
      complaint: { id: complaint._id, status: complaint.status }
    });
  } catch (error) {
    console.error('Error rejecting work:', error);
    res.status(500).json({ message: error.message });
  }
});

// COMPLETE WORK (Status: InProgress -> Completed) - WITH NOTIFICATION
router.put('/complete/:id', verifyTechnician, async (req, res) => {
  try {
    const { remarks } = req.body;
    const complaint = await Complaint.findById(req.params.id)
      .populate('userId', 'name');
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    // Verify complaint is assigned to this technician
    if (complaint.assignedTechnicianId.toString() !== req.technicianId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const oldStatus = complaint.status;
    complaint.status = 'Completed';
    complaint.completedAt = new Date();
    complaint.technicianRemarks = remarks;
    await complaint.save();
    
    // Trigger notification to user
    await NotificationService.notifyStatusChange(complaint, oldStatus, 'Completed', complaint.userId?.name);
    
    res.json({ 
      message: 'Work completed successfully', 
      complaint: { id: complaint._id, status: complaint.status, remarks }
    });
  } catch (error) {
    console.error('Error completing work:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;