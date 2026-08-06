const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    assignedTechnicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Technician",
      default: null,
      index: true,
    },

    complaintType: {
      type: String,
      required: true,
      enum: [
        "Power Cut",
        "Low Voltage",
        "High Voltage",
        "Meter Issue",
        "Billing Issue",
        "Transformer Issue",
        "Wire Damage",
        "Street Light",
        "Other",
      ],
    },

    title: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    image: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Assigned",
        "InProgress",
        "Completed",
        "Rejected",
        "Cancelled",
      ],
      default: "Pending",
      index: true,
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    remarks: {  // Keep as 'remarks' to match your controller
      type: String,
      default: "",
      trim: true,
    },

    latitude: {
      type: Number,
      default: null,
    },

    longitude: {
      type: Number,
      default: null,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    assignedAt: {
      type: Date,
      default: null,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// ==========================
// Indexes
// ==========================
complaintSchema.index({ complaintType: 1 });
complaintSchema.index({ userId: 1, status: 1 });
complaintSchema.index({ assignedTechnicianId: 1, status: 1 });
complaintSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Complaint", complaintSchema);