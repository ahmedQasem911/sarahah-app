import nodemailer from "nodemailer";
import { EventEmitter } from "node:events";

// ==================== Email Service ====================

/**
 * Send email using Nodemailer
 * @param {Object} emailOptions - Email configuration options
 * @param {string} emailOptions.receiverEmail - Recipient email address
 * @param {string} [emailOptions.cc] - CC email address (defaults to env variable)
 * @param {string} emailOptions.emailSubject - Email subject line
 * @param {string} emailOptions.emailContent - Email HTML content
 * @param {Array} [emailOptions.emailAttachments] - Array of email attachments
 * @returns {Promise<Object>} - Nodemailer send result info
 */
export const sendEmail = async ({
  receiverEmail,
  cc = process.env.EMAIL_CC,
  emailSubject,
  emailContent,
  emailAttachments = [],
}) => {
  // ========== 1. Create Email Transporter ==========
  // Configure SMTP transporter with credentials from environment variables
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // SMTP host (e.g., smtp.gmail.com)
    port: process.env.EMAIL_PORT, // SMTP port (e.g., 465 for secure)
    secure: true, // Use SSL/TLS
    auth: {
      user: process.env.EMAIL_USER, // Sender email address
      pass: process.env.EMAIL_PASSWORD, // Email password or app-specific password
    },
  });

  // ========== 2. Send Email ==========
  // Send email with configured options
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM, // Sender address
    to: receiverEmail, // Recipient address
    cc, // CC recipients (optional)
    subject: emailSubject, // Email subject
    html: emailContent, // HTML body content
    attachments: emailAttachments, // File attachments (optional)
  });

  return info;
};

// ==================== Event Emitter for Async Emails ====================

/**
 * Event emitter for sending emails asynchronously
 * Used to send emails without blocking the main application flow
 */
export const emitter = new EventEmitter();

/**
 * Listen for 'sendingEmail' event and trigger email sending
 * This allows non-blocking email operations
 */
emitter.on("sendingEmail", (emailOptions) => {
  sendEmail(emailOptions);
});
