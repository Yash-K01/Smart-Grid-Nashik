const Notification = require('../models/Notification');
const { sendStatusUpdateEmail, sendTechnicianAssignedEmail, sendNewComplaintEmail } = require('./emailService');

class NotificationService {
  
  // Create notification for user
  static async createNotification(userId, userType, title, message, complaintId = null) {
    try {
      const notification = new Notification({
        userId,
        userType,
        title,
        message,
        complaintId,
        isRead: false,
        createdAt: new Date()
      });
      
      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }
  
  // Notify user when complaint status changes
  static async notifyStatusChange(complaint, oldStatus, newStatus, userName, userEmail = null) {
    try {
      const statusMessages = {
        'Assigned': {
          title: 'Technician Assigned',
          message: `A technician has been assigned to your complaint #${complaint._id.toString().slice(-6)}`
        },
        'InProgress': {
          title: 'Work Started',
          message: `Technician has started working on your complaint #${complaint._id.toString().slice(-6)}`
        },
        'Completed': {
          title: 'Complaint Resolved',
          message: `Your complaint #${complaint._id.toString().slice(-6)} has been resolved. ${complaint.technicianRemarks ? 'Remarks: ' + complaint.technicianRemarks : ''}`
        },
        'Rejected': {
          title: 'Complaint Rejected',
          message: `Your complaint #${complaint._id.toString().slice(-6)} has been rejected. Reason: ${complaint.technicianRemarks || 'Please contact support'}`
        }
      };
      
      const notificationInfo = statusMessages[newStatus];
      
      // In-app notification
      if (notificationInfo && complaint.userId) {
        await this.createNotification(
          complaint.userId,
          'User',
          notificationInfo.title,
          notificationInfo.message,
          complaint._id
        );
      }
      
      // Send email notification if user email is available
      if (userEmail && notificationInfo) {
        await sendStatusUpdateEmail(
          userEmail,
          userName,
          complaint._id.toString().slice(-6),
          newStatus,
          complaint.technicianRemarks || ''
        );
        console.log(`📧 Email sent to ${userEmail} for status: ${newStatus}`);
      }
      
      // Notify admin when new complaint submitted
      if (oldStatus === 'Pending' && newStatus === 'Pending') {
        // Get all admins and notify them
        const Admin = require('../models/Admin');
        const admins = await Admin.find();
        
        for (const admin of admins) {
          // In-app notification for admin
          await this.createNotification(
            admin._id,
            'Admin',
            'New Complaint Received',
            `New complaint #${complaint._id.toString().slice(-6)} from ${userName}`,
            complaint._id
          );
          
          // Email notification for admin
          if (admin.email) {
            await sendNewComplaintEmail(
              admin.email,
              admin.name,
              complaint._id.toString().slice(-6),
              complaint.complaintType,
              userName,
              complaint.description || ''
            );
            console.log(`📧 New complaint email sent to admin: ${admin.email}`);
          }
        }
      }
      
    } catch (error) {
      console.error('Error sending status notification:', error);
    }
  }
  
  // Notify technician when assigned
  static async notifyTechnicianAssigned(complaint, technicianId, technicianName, technicianEmail) {
    try {
      // In-app notification for technician
      await this.createNotification(
        technicianId,
        'Technician',
        'New Complaint Assigned',
        `You have been assigned a new complaint #${complaint._id.toString().slice(-6)}. Type: ${complaint.complaintType}`,
        complaint._id
      );
      
      // Email notification for technician
      if (technicianEmail) {
        await sendTechnicianAssignedEmail(
          technicianEmail,
          technicianName,
          complaint._id.toString().slice(-6),
          complaint.complaintType,
          complaint.description || '',
          complaint.locationAddress || 'Location provided in app'
        );
        console.log(`📧 Assignment email sent to technician: ${technicianEmail}`);
      }
      
    } catch (error) {
      console.error('Error notifying technician:', error);
    }
  }
  
  // Notify user when technician completes work
  static async notifyWorkCompleted(complaint, userName, userEmail, remarks) {
    try {
      // In-app notification
      await this.createNotification(
        complaint.userId,
        'User',
        '✅ Work Completed',
        `Technician has completed the work on complaint #${complaint._id.toString().slice(-6)}. Remarks: ${remarks}`,
        complaint._id
      );
      
      // Email notification
      if (userEmail) {
        await sendStatusUpdateEmail(
          userEmail,
          userName,
          complaint._id.toString().slice(-6),
          'Completed',
          remarks
        );
        console.log(`📧 Completion email sent to user: ${userEmail}`);
      }
      
    } catch (error) {
      console.error('Error notifying work completion:', error);
    }
  }
  
  // Get all notifications for a user
  static async getUserNotifications(userId, userType) {
    try {
      const notifications = await Notification.find({ userId, userType })
        .sort({ createdAt: -1 })
        .limit(50);
      return notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }
  
  // Get unread count for a user
  static async getUnreadCount(userId, userType) {
    try {
      const count = await Notification.countDocuments({ 
        userId, 
        userType, 
        isRead: false 
      });
      return count;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }
  
  // Mark notification as read
  static async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { isRead: true },
        { new: true }
      );
      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return null;
    }
  }
  
  // Mark all notifications as read
  static async markAllAsRead(userId, userType) {
    try {
      await Notification.updateMany(
        { userId, userType, isRead: false },
        { isRead: true }
      );
      return true;
    } catch (error) {
      console.error('Error marking all as read:', error);
      return false;
    }
  }
  
  // Delete notification
  static async deleteNotification(notificationId, userId) {
    try {
      await Notification.findOneAndDelete({ _id: notificationId, userId });
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }
}

module.exports = NotificationService;