const Complaint = require('../models/Complaint');
const Technician = require('../models/Technician');
const Notification = require('../models/Notification');

// Get all complaints
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('userId', 'name email area')
      .populate('assignedTechnicianId', 'name contactNumber')
      .sort({ submittedAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign technician to complaint
exports.assignTechnician = async (req, res) => {
  try {
    const { complaintId, technicianId } = req.body;
    
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    complaint.assignedTechnicianId = technicianId;
    complaint.status = 'Assigned';
    complaint.assignedAt = Date.now();
    await complaint.save();
    
    // Create notification for technician
    await Notification.create({
      userId: technicianId,
      userType: 'Technician',
      title: 'New Complaint Assigned',
      message: `You have been assigned complaint #${complaintId}`,
      complaintId: complaintId
    });
    
    // Create notification for user
    await Notification.create({
      userId: complaint.userId,
      userType: 'User',
      title: 'Technician Assigned',
      message: `A technician has been assigned to your complaint #${complaintId}`,
      complaintId: complaintId
    });
    
    res.json({ message: 'Technician assigned successfully', complaint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Register technician
exports.registerTechnician = async (req, res) => {
  try {
    const { name, education, experience, contactNumber, email, location, password } = req.body;
    
    const technicianExists = await Technician.findOne({ email });
    if (technicianExists) {
      return res.status(400).json({ message: 'Technician already exists' });
    }
    
    const technician = await Technician.create({
      name, education, experience, contactNumber, email, location, password
    });
    
    res.status(201).json({ message: 'Technician registered successfully', technician });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all technicians
exports.getTechnicians = async (req, res) => {
  try {
    const technicians = await Technician.find({ isAvailable: true });
    res.json(technicians);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete technician
exports.deleteTechnician = async (req, res) => {
  try {
    await Technician.findByIdAndDelete(req.params.id);
    res.json({ message: 'Technician deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};