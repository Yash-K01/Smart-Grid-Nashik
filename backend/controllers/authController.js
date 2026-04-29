const User = require('../models/User');
const Admin = require('../models/Admin');
const Technician = require('../models/Technician');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// User Registration
exports.registerUser = async (req, res) => {
  try {
    const { name, mobile, address, meterNumber, area, email, password } = req.body;
    
    const userExists = await User.findOne({ $or: [{ email }, { meterNumber }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const user = await User.create({
      name, mobile, address, meterNumber, area, email, password
    });
    
    res.status(201).json({
      message: 'Registration successful',
      token: generateToken(user._id, 'user'),
      user: { id: user._id, name: user.name, email: user.email, role: 'user' }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// User Login
exports.loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    if (role === 'user') {
      const user = await User.findOne({ email });
      if (user && await user.comparePassword(password)) {
        res.json({
          message: 'Login successful',
          token: generateToken(user._id, 'user'),
          user: { id: user._id, name: user.name, email: user.email, role: 'user' }
        });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    }
    else if (role === 'admin') {
      const admin = await Admin.findOne({ email });
      if (admin && await admin.comparePassword(password)) {
        res.json({
          message: 'Login successful',
          token: generateToken(admin._id, 'admin'),
          user: { id: admin._id, name: admin.name, email: admin.email, role: 'admin' }
        });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    }
    else if (role === 'technician') {
      const technician = await Technician.findOne({ email });
      if (technician && await technician.comparePassword(password)) {
        res.json({
          message: 'Login successful',
          token: generateToken(technician._id, 'technician'),
          user: { id: technician._id, name: technician.name, email: technician.email, role: 'technician' }
        });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};