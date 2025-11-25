import logger from '../../utils/logger.util';
import { mailConfig, transporter } from '../../config/mail.config';

/**
 * Global Email Service
 * Kết nối cấu hình mail (nodemailer) để gửi email thực tế
 */
export class EmailService {
  constructor() {
    // Có thể gọi verifyMailConnection() tại đây nếu muốn kiểm tra kết nối khi khởi động
  }

  /**
   * Gửi email chung
   */
  async sendEmail(options: {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
  }): Promise<void> {
    try {
      const to = Array.isArray(options.to) ? options.to.join(', ') : options.to;

      logger.info('Sending email', {
        to,
        subject: options.subject
      });

      await transporter.sendMail({
        from: mailConfig.from,
        to,
        subject: options.subject,
        text: options.text,
        html: options.html
      });

      logger.info('Email sent successfully', {
        to,
        subject: options.subject
      });
    } catch (error: unknown) {
      logger.error('Error sending email:', error);
      throw error;
    }
  }

  /**
   * Gửi email xác thực tài khoản
   */
  async sendVerificationEmail(email: string, verificationToken: string): Promise<void> {
    try {
      logger.info('Sending verification email', { email });

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;

      await this.sendEmail({
        to: email,
        subject: 'Verify your email address',
        html: `
          <h2>Verify your email address</h2>
          <p>Please click the link below to verify your email address:</p>
          <a href="${verificationUrl}">Verify Email</a>
          <p>This link will expire in 24 hours.</p>
        `
      });

      logger.info('Verification email sent successfully', { email });
    } catch (error: unknown) {
      logger.error('Error sending verification email:', error);
      throw error;
    }
  }

  /**
   * Gửi email chứa link reset mật khẩu
   */
  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    try {
      logger.info('Sending password reset email', { email });

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

      await this.sendEmail({
        to: email,
        subject: 'Reset your password',
        html: `
          <h2>Reset your password</h2>
          <p>You have requested to reset your password.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}">Reset Password</a>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `
      });

      logger.info('Password reset email sent successfully', { email });
    } catch (error: unknown) {
      logger.error('Error sending password reset email:', error);
      throw error;
    }
  }

  /**
   * Gửi email chứa mật khẩu mới (reset bằng mật khẩu ngẫu nhiên)
   */
  async sendNewPasswordEmail(email: string, newPassword: string): Promise<void> {
    try {
      logger.info('Sending new password email', { email });

      await this.sendEmail({
        to: email,
        subject: 'Your new password',
        html: `
          <h2>Your password has been reset</h2>
          <p>Your account password has been reset by request.</p>
          <p><strong>New password:</strong> ${newPassword}</p>
          <p>For security, please log in and change this password immediately.</p>
        `
      });

      logger.info('New password email sent successfully', { email });
    } catch (error: unknown) {
      logger.error('Error sending new password email:', error);
      throw error;
    }
  }

  /**
   * Gửi email chào mừng
   */
  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    try {
      logger.info('Sending welcome email', { email });

      await this.sendEmail({
        to: email,
        subject: 'Welcome to our platform!',
        html: `
          <h2>Welcome ${firstName}!</h2>
          <p>Thank you for joining our platform. We're excited to have you on board!</p>
          <p>If you have any questions, feel free to contact our support team.</p>
        `
      });

      logger.info('Welcome email sent successfully', { email });
    } catch (error: unknown) {
      logger.error('Error sending welcome email:', error);
      throw error;
    }
  }

  /**
   * Gửi email thông báo chung
   */
  async sendNotificationEmail(email: string, subject: string, message: string): Promise<void> {
    try {
      logger.info('Sending notification email', { email, subject });

      await this.sendEmail({
        to: email,
        subject,
        html: `
          <h2>${subject}</h2>
          <p>${message}</p>
        `
      });

      logger.info('Notification email sent successfully', { email, subject });
    } catch (error: unknown) {
      logger.error('Error sending notification email:', error);
      throw error;
    }
  }
}


