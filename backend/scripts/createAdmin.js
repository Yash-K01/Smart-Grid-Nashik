const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

async function createAdmin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/smartgrid');
    console.log('✅ Connected to MongoDB');
    
    // Delete existing admin
    await Admin.deleteOne({ email: 'admin@smartgrid.com' });
    console.log('✅ Removed existing admin');
    
    // Create new admin
    const admin = new Admin({
      email: 'admin@smartgrid.com',
      password: 'admin123',
      name: 'System Administrator'
    });
    
    await admin.save();
    
    console.log('\n✅ Admin Created Successfully!\n');
    console.log('╔════════════════════════════════════════╗');
    console.log('║     ADMIN LOGIN CREDENTIALS            ║');
    console.log('╠════════════════════════════════════════╣');
    console.log('║ 📧 Email:  admin@smartgrid.com         ║');
    console.log('║ 🔑 Password: admin123                  ║');
    console.log('║ 👤 Name:    System Administrator       ║');
    console.log('╚════════════════════════════════════════╝\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createAdmin();