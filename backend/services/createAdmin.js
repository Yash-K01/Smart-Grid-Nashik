const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function createAdmin() {
  const admin = new User({
    name: "Admin User",
    email: "admin@smartgrid.com",
    password: await bcrypt.hash("Admin@123", 10),
    role: "admin",
    mobile: "9876543210",
    isActive: true
  });
  
  await admin.save();
  console.log("Admin created successfully!");
}

createAdmin();