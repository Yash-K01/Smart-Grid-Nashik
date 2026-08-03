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

    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      default: null,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    type: {
      type: String,
      enum: [
        "GENERAL",
        "NEW_COMPLAINT",
        "ASSIGNED",
        "STATUS_UPDATED",
        "COMPLETED",
        "REJECTED",
        "SYSTEM"
      ],
      default: "GENERAL",
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    readAt: {
      type: Date,
      default: null,
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
});

notificationSchema.index({
  complaintId: 1,
});

notificationSchema.index({
  isRead: 1,
});

notificationSchema.index({
  createdAt: -1,
});

// ==============================
// Mark as Read
// ==============================
notificationSchema.methods.markAsRead = async function () {
  this.isRead = true;
  this.readAt = new Date();
  return await this.save();
};

module.exports = mongoose.model("Notification", notificationSchema);