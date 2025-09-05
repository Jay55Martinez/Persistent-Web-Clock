import dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config();


export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // your Gmail address
    pass: process.env.GMAIL_APP_PASSWORD, // the app password
  },
});

export default transporter;
