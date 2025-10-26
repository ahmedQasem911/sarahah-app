import nodemailer from "nodemailer";
import { EventEmitter } from "node:events";

// ==================== Email Service ====================

/**
 * Send email using Nodemailer
 * @param {Object} emailOptions - Email configuration options
 * @param {string} emailOptions.receiverEmail - Recipient email address
 * @param {string} [emailOptions.cc] - CC email address
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
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // ========== 2. Send Email ==========
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: receiverEmail,
    cc,
    subject: emailSubject,
    html: emailContent,
    attachments: emailAttachments,
  });

  return info;
};

// ==================== Event Emitter for Async Emails ====================

export const emitter = new EventEmitter();

emitter.on("sendingEmail", (emailOptions) => {
  sendEmail(emailOptions);
});
