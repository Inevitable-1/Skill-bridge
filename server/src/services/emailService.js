const nodemailer = require('nodemailer');
const config = require('../config/constants');

const createTransporter = () => {
  if (!config.smtp.host) {
    console.warn('SMTP not configured - emails will not be sent');
    return null;
  }
  return nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: false,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  });
};

const sendEmail = async (to, subject, html) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.log(`Email skipped (no SMTP): ${subject} to ${to}`);
    return { success: false, message: 'SMTP not configured' };
  }

  try {
    await transporter.sendMail({
      from: config.emailFrom,
      to,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

const sendVerificationEmail = async (email, token) => {
  const verifyUrl = `${config.clientUrl}/verify-email?token=${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #4F46E5;">Welcome to SkillBridge!</h2>
      <p>Please verify your email address to get started.</p>
      <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
        Verify Email
      </a>
      <p style="color: #666; font-size: 14px;">If you didn't create an account, please ignore this email.</p>
    </div>
  `;
  return sendEmail(email, 'Verify your SkillBridge account', html);
};

const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${config.clientUrl}/reset-password?token=${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #4F46E5;">Reset Your Password</h2>
      <p>Click the link below to reset your password.</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
        Reset Password
      </a>
      <p style="color: #666; font-size: 14px;">This link expires in 1 hour. If you didn't request this, please ignore.</p>
    </div>
  `;
  return sendEmail(email, 'Reset your SkillBridge password', html);
};

module.exports = { sendEmail, sendVerificationEmail, sendPasswordResetEmail };
