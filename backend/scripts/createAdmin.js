// scripts/createAdmin.js
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import Admin model
const Admin = require('../models/Admin');

async function createAdmin() {
  try {
    // Check MONGODB_URI
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI not found in .env file');
      console.log('Please add MONGODB_URI to your .env file');
      process.exit(1);
    }

    console.log('📡 Connecting to MongoDB Atlas...');
    console.log('Using MONGODB_URI:', process.env.MONGODB_URI.replace(/\/\/.*@/, '//****:****@'));
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@smartgrid.com' });
    
    if (existingAdmin) {
      console.log('⚠️ Admin already exists!');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Name:', existingAdmin.name);
      console.log('🔄 Updating password...');
      
      // Update password using the model's pre-save hook
      existingAdmin.password = 'admin123'; // This will be hashed by pre-save hook
      await existingAdmin.save();
      
      console.log('✅ Password updated successfully!');
    } else {
      console.log('📝 Creating new admin...');
      
      // Create new admin - password will be hashed by pre-save hook
      const admin = new Admin({
        name: 'System Administrator',
        email: 'admin@smartgrid.com',
        password: 'admin123', // This will be automatically hashed
        role: 'admin'
      });
      
      await admin.save();
      console.log('✅ New admin created successfully!');
    }
    
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║     ADMIN LOGIN CREDENTIALS            ║');
    console.log('╠════════════════════════════════════════╣');
    console.log('║ 📧 Email:  admin@smartgrid.com         ║');
    console.log('║ 🔑 Password: admin123                  ║');
    console.log('║ 👤 Name:    System Administrator       ║');
    console.log('║ 🎭 Role:    admin                      ║');
    console.log('╚════════════════════════════════════════╝\n');
    
    // Verify the admin was created
    const verifyAdmin = await Admin.findOne({ email: 'admin@smartgrid.com' });
    if (verifyAdmin) {
      console.log('✅ Verification: Admin exists in database!');
      console.log('📧 Email:', verifyAdmin.email);
      console.log('👤 Name:', verifyAdmin.name);
      console.log('🎭 Role:', verifyAdmin.role);
    }
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.name === 'MongoServerSelectionError') {
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. Check your internet connection');
      console.log('2. Verify MONGODB_URI is correct in .env');
      console.log('3. Check if IP is whitelisted in MongoDB Atlas');
      console.log('4. Verify username and password are correct');
    }
    
    if (error.stack) {
      console.log('\n📚 Stack trace:', error.stack);
    }
    
    process.exit(1);
  }
}

createAdmin();