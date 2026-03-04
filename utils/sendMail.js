import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL,
    pass: process.env.PASSWORD,
  },
});

/**
 * Send an email.
 * @param {string} to      – recipient email address
 * @param {string} subject  – email subject
 * @param {string} html     – email body (HTML)
 */
export const sendMail = async (to, subject, html) => {
  await transporter.sendMail({
    from: `"FestMate" <${process.env.GMAIL}>`,
    to,
    subject,
    html,
  });
};
