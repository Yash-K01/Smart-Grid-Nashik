const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');

// Submit Complaint
exports.submitComplaint = async (req, res) => {
  try {
    const { complaintType, description, imageUrl, location } = req.body;
    
    const complaint = await Complaint.create({
      userId: req.user.id,
      complaintType,
      description,
      imageUrl,
      location,
      status: 'Pending'
    });
    
    // Notify admins (you can implement email here)
    
    res.status(201).json({ message: 'Complaint submitted successfully', complaint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get User Complaints
exports.getUserComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ userId: req.user.id })
      .sort({ submittedAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Complaint Details
exports.getComplaintDetails = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('userId', 'name email mobile')
      .populate('assignedTechnicianId', 'name contactNumber');
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};