const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const technicianSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Technician name is required"],
      trim: true,
      minlength: 3,
      maxlength: 100,
    },

    education: {
      type: String,
      trim: true,
      default: "",
    },

    experience: {
      type: String,
      trim: true,
      default: "",
    },

    contactNumber: {
      type: String,
      required: [true, "Contact number is required"],
      unique: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, "Please enter a valid mobile number"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },

    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },

    // FIX 1: Change from 'isAvailable' to 'status' to match frontend
    status: {
      type: String,
      enum: ['available', 'busy'],
      default: 'available',
    },

    // FIX 2: Add this field for tracking assigned complaints
    assignedComplaints: {
      type: Number,
      default: 0,
    },

    latitude: {
      type: Number,
      default: null,
    },

    longitude: {
      type: Number,
      default: null,
    },

    role: {
      type: String,
      enum: ["technician"],
      default: "technician",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ====================================
// Hash Password
// ====================================
technicianSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ====================================
// Compare Password
// ====================================
technicianSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ====================================
// Hide Password
// ====================================
technicianSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// ====================================
// Indexes
// ====================================
technicianSchema.index({ status: 1 }); // Changed from isAvailable
technicianSchema.index({ assignedTechnicianId: 1 }); // For faster queries

module.exports = mongoose.model("Technician", technicianSchema);