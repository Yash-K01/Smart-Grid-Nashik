const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Complaint = require('../models/Complaint');

// Create uploads directory if not exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Middleware to verify user token
const verifyUser = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'user') {
      return res.status(403).json({ message: 'User access required' });
    }
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// SUBMIT COMPLAINT - WITH IMAGE UPLOAD
router.post('/complaint', verifyUser, upload.single('image'), async (req, res) => {
  try {
    const { complaintType, description, latitude, longitude, address } = req.body;
    
    const complaint = new Complaint({
      userId: req.userId,
      complaintType,
      description: description || '',
      imageUrl: req.file ? `/uploads/${req.file.filename}` : '',
      latitude: latitude || null,
      longitude: longitude || null,
      locationAddress: address || '',
      status: 'Pending'
    });
    
    await complaint.save();
    
    res.status(201).json({ 
      message: 'Complaint submitted successfully', 
      complaint: {
        id: complaint._id,
        complaintType: complaint.complaintType,
        status: complaint.status
      }
    });
  } catch (error) {
    console.error('Error submitting complaint:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET USER'S COMPLAINTS
router.get('/complaints', verifyUser, async (req, res) => {
  try {
    const complaints = await Complaint.find({ userId: req.userId })
      .populate('assignedTechnicianId', 'name contactNumber')
      .sort({ submittedAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET SINGLE COMPLAINT DETAILS
router.get('/complaint/:id', verifyUser, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('userId', 'name email mobile')
      .populate('assignedTechnicianId', 'name contactNumber');
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    // Check if complaint belongs to the user
    if (complaint.userId._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET NOTIFICATIONS
router.get('/notifications', verifyUser, async (req, res) => {
  try {
    // For now return empty array - implement notification system later
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET NOTIFICATION COUNT
router.get('/notifications/count', verifyUser, async (req, res) => {
  try {
    res.json({ count: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// MARK NOTIFICATION AS READ
router.put('/notifications/:id/read', verifyUser, async (req, res) => {
  try {
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;