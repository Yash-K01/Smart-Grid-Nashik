const User = require("../models/User");
const Admin = require("../models/Admin");
const Technician = require("../models/Technician");
const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (id, role) => {
    return jwt.sign(
        { id, role },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
    );
};

// ===========================
// User Registration
// ===========================
exports.registerUser = async (req, res) => {
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

        const existingUser = await User.findOne({
            $or: [{ email }, { meterNumber }],
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists.",
            });
        }

        const user = await User.create({
            name,
            mobile,
            address,
            meterNumber,
            area,
            email,
            password,
        });

        res.status(201).json({
            success: true,
            message: "Registration successful.",
            token: generateToken(user._id, "user"),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: "user",
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ===========================
// Login (Admin/User/Technician)
// ===========================
exports.login = async (req, res) => {
    try {

        const { email, password, role } = req.body;

        let account;

        switch (role) {

            case "admin":
                account = await Admin.findOne({ email });
                break;

            case "user":
                account = await User.findOne({ email });
                break;

            case "technician":
                account = await Technician.findOne({ email });
                break;

            default:
                return res.status(400).json({
                    success: false,
                    message: "Invalid role.",
                });
        }

        if (!account) {
            return res.status(401).json({
                success: false,
                message: "Invalid Email or Password.",
            });
        }

        const matched = await account.comparePassword(password);

        if (!matched) {
            return res.status(401).json({
                success: false,
                message: "Invalid Email or Password.",
            });
        }

        res.json({
            success: true,
            message: `${role} login successful.`,
            token: generateToken(account._id, role),
            user: {
                id: account._id,
                name: account.name,
                email: account.email,
                role,
            },
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};