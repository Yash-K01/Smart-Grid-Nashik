// backend/controllers/authController.js
const User = require("../models/User");
const Admin = require("../models/Admin");
const Technician = require("../models/Technician");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// ===========================
// Generate JWT Token
// ===========================
const generateToken = (id, role) => {
    // Check if JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
        console.error('❌ JWT_SECRET is not defined in environment variables');
        throw new Error('JWT_SECRET is not configured');
    }
    
    return jwt.sign(
        { id, role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" } // Changed from 30d to 7d for better security
    );
};

// ===========================
// User Registration
// ===========================
exports.registerUser = async (req, res) => {
    console.log('📝 Registration request received:');
    console.log('Email:', req.body.email);
    console.log('Role:', req.body.role || 'user');

    try {
        const {
            name,
            mobile,
            address,
            meterNumber,
            area,
            email,
            password,
        } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { meterNumber }],
        });

        if (existingUser) {
            console.log('❌ User already exists:', email);
            return res.status(400).json({
                success: false,
                message: "User already exists with this email or meter number.",
            });
        }

        // Create new user
        const user = await User.create({
            name,
            mobile,
            email,
            password,
            address: address || '',
            meterNumber: meterNumber || '',
            area: area || '',
            role: 'user',
            isActive: true
        });

        console.log('✅ User registered successfully:', user.email);

        res.status(201).json({
            success: true,
            message: "Registration successful.",
            token: generateToken(user._id, "user"),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile || '',
                role: "user",
            },
        });
    } catch (error) {
        console.error('❌ Registration error:', error);
        
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "User already exists with this email or meter number.",
            });
        }

        res.status(500).json({
            success: false,
            message: error.message || "Registration failed. Please try again.",
        });
    }
};

// ===========================
// Login (Admin/User/Technician)
// ===========================
exports.login = async (req, res) => {
    console.log('📝 Login request received:');
    console.log('Email:', req.body.email);
    console.log('Role:', req.body.role);

    try {
        const { email, password, role } = req.body;

        // Validate input
        if (!email || !password || !role) {
            console.log('❌ Missing required fields');
            return res.status(400).json({
                success: false,
                message: "Email, password, and role are required.",
            });
        }

        let account;
        let modelName;

        // Find account based on role
        switch (role) {
            case "admin":
                account = await Admin.findOne({ email }).select('+password');
                modelName = "Admin";
                break;

            case "user":
                account = await User.findOne({ email }).select('+password');
                modelName = "User";
                break;

            case "technician":
                account = await Technician.findOne({ email }).select('+password');
                modelName = "Technician";
                break;

            default:
                console.log('❌ Invalid role:', role);
                return res.status(400).json({
                    success: false,
                    message: "Invalid role. Must be admin, user, or technician.",
                });
        }

        // Check if account exists
        if (!account) {
            console.log(`❌ ${modelName} not found with email:`, email);
            return res.status(401).json({
                success: false,
                message: "Invalid Email or Password.",
            });
        }

        console.log(`✅ ${modelName} found:`, account.email);
        console.log(`👤 Role:`, account.role || role);

        // Check if account is active
        if (account.isActive === false) {
            console.log('❌ Account is deactivated:', email);
            return res.status(403).json({
                success: false,
                message: "Your account has been deactivated. Please contact admin.",
            });
        }

        // Check password - try using comparePassword method first
        let matched = false;
        
        if (typeof account.comparePassword === 'function') {
            console.log('🔑 Using comparePassword method...');
            matched = await account.comparePassword(password);
        } else {
            console.log('🔑 Using bcrypt fallback...');
            matched = await bcrypt.compare(password, account.password);
        }

        if (!matched) {
            console.log('❌ Password mismatch for:', email);
            return res.status(401).json({
                success: false,
                message: "Invalid Email or Password.",
            });
        }

        console.log('✅ Password matched!');

        // Generate token
        let token;
        try {
            token = generateToken(account._id, role);
        } catch (tokenError) {
            console.error('❌ Token generation error:', tokenError);
            return res.status(500).json({
                success: false,
                message: "Server configuration error. Please contact support.",
            });
        }

        console.log('✅ Token generated successfully');

        // Prepare user response
        const userResponse = {
            id: account._id,
            name: account.name,
            email: account.email,
            role: role,
            mobile: account.mobile || '',
        };

        // Add role-specific fields
        if (role === 'user') {
            userResponse.meterNumber = account.meterNumber || '';
            userResponse.area = account.area || '';
            userResponse.address = account.address || '';
        } else if (role === 'technician') {
            userResponse.location = account.location || '';
            userResponse.education = account.education || '';
            userResponse.experience = account.experience || '';
        }

        // Return response
        res.json({
            success: true,
            message: `${role} login successful.`,
            token: token,
            user: userResponse,
        });

    } catch (error) {
        console.error('❌ Login error:', error);
        console.error('Error stack:', error.stack);

        res.status(500).json({
            success: false,
            message: error.message || "Login failed. Please try again.",
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        });
    }
};