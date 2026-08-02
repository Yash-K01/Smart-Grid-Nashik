const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "recipientType",
      index: true,
    },

    recipientType: {
      type: String,
      required: true,
      enum: ["User", "Admin", "Technician"],
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ==============================
// Indexes
// ==============================
notificationSchema.index({
  recipientId: 1,
  recipientType: 1,
  isRead: 1,
});

notificationSchema.index({
  createdAt: -1,
});

module.exports = mongoose.model("Notification", notificationSchema);