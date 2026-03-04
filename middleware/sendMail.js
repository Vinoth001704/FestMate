import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL,
    pass: process.env.PASSWORD, // app password
  },
});

export default async function sendMail(to, subject, text) {
  await transporter.sendMail({ from: process.env.GMAIL, to, subject, text });
}
