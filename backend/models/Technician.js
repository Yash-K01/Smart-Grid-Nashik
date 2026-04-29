const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const technicianSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  education: {
    type: String,
    default: ''
  },
  experience: {
    type: String,
    default: ''
  },
  contactNumber: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  location: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  latitude: {
    type: Number,
    default: null
  },
  longitude: {
    type: Number,
    default: null
  },
  role: {
    type: String,
    default: 'technician'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

technicianSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

technicianSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Technician', technicianSchema);