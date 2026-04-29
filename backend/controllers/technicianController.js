const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');

// Get assigned complaints
exports.getAssignedComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ 
      assignedTechnicianId: req.user.id,
      status: { $ne: 'Completed' }
    }).populate('userId', 'name address mobile location');
    
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Accept work
exports.acceptWork = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    complaint.status = 'InProgress';
    complaint.startedAt = Date.now();
    await complaint.save();
    
    // Notify user
    await Notification.create({
      userId: complaint.userId,
      userType: 'User',
      title: 'Work Started',
      message: `Technician has started working on your complaint #${complaint.id}`,
      complaintId: complaint.id
    });
    
    res.json({ message: 'Work accepted', complaint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Complete work
exports.completeWork = async (req, res) => {
  try {
    const { remarks } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    complaint.status = 'Completed';
    complaint.completedAt = Date.now();
    complaint.technicianRemarks = remarks;
    await complaint.save();
    
    // Notify user
    await Notification.create({
      userId: complaint.userId,
      userType: 'User',
      title: 'Complaint Resolved',
      message: `Your complaint #${complaint.id} has been resolved. Remarks: ${remarks}`,
      complaintId: complaint.id
    });
    
    res.json({ message: 'Work completed', complaint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};