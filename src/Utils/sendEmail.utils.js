import nodemailer from "nodemailer";
import { EventEmitter } from "node:events";

export const sendEmail = async ({
  receiverEmail,
  cc = process.env.EMAIL_CC,
  emailSubject,
  emailContent,
  emailAttachments = [],
}) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

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

export const emitter = new EventEmitter();

emitter.on("sendingEmail", (args) => {
  sendEmail(args);
});
