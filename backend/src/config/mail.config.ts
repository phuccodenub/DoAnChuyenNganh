import nodemailer from 'nodemailer';
import logger from '@utils/logger.util';

// Mail configuration
export const mailConfig = {
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.MAIL_PORT || '587'),
  secure: process.env.MAIL_SECURE === 'true',
  auth: {
    user: process.env.MAIL_USER || '',
    pass: process.env.MAIL_PASS || ''
  },
  from: process.env.MAIL_FROM || 'LMS System <noreply@lms.com>'
};

// Create transporter
const transporter = nodemailer.createTransport(mailConfig);

// Verify connection
export async function verifyMailConnection(): Promise<void> {
  try {
    await transporter.verify();
    logger.info('Mail service connection verified successfully');
  } catch (error) {
    logger.error('Mail service connection failed:', error);
    throw error;
  }
}

// Mail helper functions
export const mailHelpers = {
  // Send welcome email
  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    try {
      const mailOptions = {
        from: mailConfig.from,
        to,
        subject: 'Welcome to LMS Platform',
        html: `
          <h1>Welcome to LMS Platform!</h1>
          <p>Hello ${name},</p>
          <p>Your account has been successfully created. You can now start learning!</p>
          <p>Best regards,<br>LMS Team</p>
        `
      };

      await transporter.sendMail(mailOptions);
      logger.info(`Welcome email sent to ${to}`);
    } catch (error) {
      logger.error('Welcome email sending error:', error);
      throw error;
    }
  },

  // Send password reset email
  async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: mailConfig.from,
        to,
        subject: 'Password Reset Request',
        html: `
          <h1>Password Reset Request</h1>
          <p>You have requested to reset your password.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>LMS Team</p>
        `
      };

      await transporter.sendMail(mailOptions);
      logger.info(`Password reset email sent to ${to}`);
    } catch (error) {
      logger.error('Password reset email sending error:', error);
      throw error;
    }
  },

  // Send notification email
  async sendNotificationEmail(to: string, subject: string, message: string): Promise<void> {
    try {
      const mailOptions = {
        from: mailConfig.from,
        to,
        subject,
        html: `
          <h1>${subject}</h1>
          <p>${message}</p>
          <p>Best regards,<br>LMS Team</p>
        `
      };

      await transporter.sendMail(mailOptions);
      logger.info(`Notification email sent to ${to}`);
    } catch (error) {
      logger.error('Notification email sending error:', error);
      throw error;
    }
  }
};

export { transporter };
