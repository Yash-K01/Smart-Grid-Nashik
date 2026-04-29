const nodemailer = require('nodemailer');

// Create transporter (configure based on environment)
const createTransporter = () => {
  // For production with Gmail
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  
  // For development/testing with Ethereal (fake email)
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'your-ethereal-user@ethereal.email',
      pass: 'your-ethereal-password'
    }
  });
};

const transporter = createTransporter();

// Send general email
const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"SmartGridSystem" <${process.env.EMAIL_USER || 'noreply@smartgrid.com'}>`,
      to,
      subject,
      html
    });
    console.log(`✅ Email sent to ${to}`, info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Email error:', error.message);
    return false;
  }
};

// Send status update email to user
const sendStatusUpdateEmail = async (userEmail, userName, complaintId, status, remarks = '') => {
  const statusColors = {
    'Assigned': '#3b82f6',
    'InProgress': '#8b5cf6',
    'Completed': '#10b981',
    'Rejected': '#ef4444'
  };
  
  const statusMessages = {
    'Assigned': 'Technician Assigned',
    'InProgress': 'Work In Progress',
    'Completed': 'Complaint Resolved',
    'Rejected': 'Complaint Rejected'
  };
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .status-badge { display: inline-block; padding: 8px 16px; background-color: ${statusColors[status] || '#6b7280'}; color: white; border-radius: 20px; font-size: 14px; font-weight: bold; margin: 10px 0; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; }
        .button { display: inline-block; padding: 10px 20px; background-color: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚡ SmartGridSystem</h1>
          <p style="color: #e0e0e0; margin: 5px 0 0;">Electricity Complaint Management</p>
        </div>
        <div class="content">
          <h2>Hello ${userName},</h2>
          <p>Your complaint status has been updated.</p>
          <div style="text-align: center;">
            <span class="status-badge">${statusMessages[status] || status}</span>
          </div>
          <p><strong>Complaint ID:</strong> #${complaintId}</p>
          <p><strong>Status:</strong> ${status}</p>
          ${remarks ? `<p><strong>Remarks:</strong> ${remarks}</p>` : ''}
          <p>You can track your complaint in real-time by clicking the button below:</p>
          <div style="text-align: center;">
            <a href="http://localhost:5173/user/track-complaint" class="button">Track Complaint</a>
          </div>
        </div>
        <div class="footer">
          <p>SmartGridSystem - Making electricity management smarter</p>
          <p>© 2024 SmartGridSystem. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return await sendEmail(userEmail, `Complaint #${complaintId} Status: ${status}`, html);
};

// Send new complaint notification to admin
const sendNewComplaintEmail = async (adminEmail, adminName, complaintId, complaintType, userName, description) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; }
        .header h1 { color: white; margin: 0; }
        .content { padding: 30px; }
        .button { display: inline-block; padding: 10px 20px; background-color: #667eea; color: white; text-decoration: none; border-radius: 5px; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 New Complaint Received</h1>
        </div>
        <div class="content">
          <h2>Hello ${adminName},</h2>
          <p>A new complaint has been submitted and requires your attention.</p>
          <p><strong>Complaint ID:</strong> #${complaintId}</p>
          <p><strong>Type:</strong> ${complaintType}</p>
          <p><strong>Customer:</strong> ${userName}</p>
          ${description ? `<p><strong>Description:</strong> ${description}</p>` : ''}
          <div style="text-align: center;">
            <a href="http://localhost:5173/admin/complaints" class="button">View Complaint</a>
          </div>
        </div>
        <div class="footer">
          <p>SmartGridSystem Admin Portal</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return await sendEmail(adminEmail, `New Complaint #${complaintId} Received`, html);
};

// Send technician assignment email
const sendTechnicianAssignedEmail = async (techEmail, techName, complaintId, complaintType, description, location) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; }
        .header h1 { color: white; margin: 0; }
        .content { padding: 30px; }
        .button { display: inline-block; padding: 10px 20px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔧 New Complaint Assigned</h1>
        </div>
        <div class="content">
          <h2>Hello ${techName},</h2>
          <p>You have been assigned a new complaint.</p>
          <p><strong>Complaint ID:</strong> #${complaintId}</p>
          <p><strong>Type:</strong> ${complaintType}</p>
          ${description ? `<p><strong>Description:</strong> ${description}</p>` : ''}
          <p><strong>Location:</strong> ${location}</p>
          <div style="text-align: center;">
            <a href="http://localhost:5173/technician/assignments" class="button">View Assignment</a>
          </div>
        </div>
        <div class="footer">
          <p>SmartGridSystem Technician Portal</p>
        </div>
      </div>
    </html>
  `;
  
  return await sendEmail(techEmail, `New Assignment #${complaintId}`, html);
};

module.exports = { 
  sendEmail, 
  sendStatusUpdateEmail, 
  sendNewComplaintEmail, 
  sendTechnicianAssignedEmail 
};