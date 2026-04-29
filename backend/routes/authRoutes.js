const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Technician = require('../models/Technician');

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// User Registration
router.post('/register', async (req, res) => {
  try {
    const { name, mobile, address, meterNumber, area, email, password } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { meterNumber }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email or meter number' });
    }
    
    const user = new User({
      name, mobile, address, meterNumber, area, email, password
    });
    
    await user.save();
    res.status(201).json({ message: 'Registration successful! Please login.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    if (role === 'admin') {
      const admin = await Admin.findOne({ email });
      if (admin && await admin.comparePassword(password)) {
        const token = generateToken(admin._id, 'admin');
        res.json({
          message: 'Admin login successful',
          token,
          user: { 
            _id: admin._id,
            id: admin._id, 
            name: admin.name, 
            email: admin.email, 
            role: 'admin' 
          }
        });
      } else {
        res.status(401).json({ message: 'Invalid admin credentials' });
      }
    } 
    else if (role === 'user') {
      const user = await User.findOne({ email });
      if (user && await user.comparePassword(password)) {
        const token = generateToken(user._id, 'user');
        res.json({
          message: 'User login successful',
          token,
          user: { 
            _id: user._id,
            id: user._id, 
            name: user.name, 
            email: user.email, 
            role: 'user' 
          }
        });
      } else {
        res.status(401).json({ message: 'Invalid user credentials' });
      }
    } 
    else if (role === 'technician') {
      const technician = await Technician.findOne({ email });
      if (technician && await technician.comparePassword(password)) {
        const token = generateToken(technician._id, 'technician');
        res.json({
          message: 'Technician login successful',
          token,
          user: { 
            _id: technician._id,
            id: technician._id, 
            name: technician.name, 
            email: technician.email, 
            role: 'technician' 
          }
        });
      } else {
        res.status(401).json({ message: 'Invalid technician credentials' });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;