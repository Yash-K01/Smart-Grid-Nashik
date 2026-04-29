const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  complaintType: {
    type: String,
    enum: ['Power Cut', 'Low Voltage', 'High Voltage', 'Meter Issue', 'Billing Issue', 'Transformer Issue', 'Wire Damage', 'Other'],
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: ''
  },
  latitude: {
    type: Number,
    default: null
  },
  longitude: {
    type: Number,
    default: null
  },
  locationAddress: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Pending', 'Assigned', 'InProgress', 'Completed', 'Rejected'],
    default: 'Pending'
  },
  assignedTechnicianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Technician',
    default: null
  },
  technicianRemarks: {
    type: String,
    default: ''
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  assignedAt: {
    type: Date,
    default: null
  },
  startedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  }
});

// Add indexes for better query performance
complaintSchema.index({ userId: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ submittedAt: -1 });
complaintSchema.index({ assignedTechnicianId: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);