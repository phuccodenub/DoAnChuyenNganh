import logger from '../../utils/logger.util';

/**
 * Global Email Service
 * Handles email operations like sending emails, templates
 */
export class EmailService {
  constructor() {
    // Initialize email service
  }

  /**
   * Send email
   */
  async sendEmail(options: {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    template?: string;
    templateData?: Record<string, unknown>;
  }): Promise<void> {
    try {
      logger.info('Sending email', { 
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject 
      });

      // In a real implementation, you would use an email service like SendGrid, AWS SES, etc.
      // For now, we'll simulate the email sending
      
      logger.info('Email sent successfully', { 
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject 
      });
    } catch (error: unknown) {
      logger.error('Error sending email:', error);
      throw error;
    }
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(email: string, verificationToken: string): Promise<void> {
    try {
      logger.info('Sending verification email', { email });

      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
      
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
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    try {
      logger.info('Sending password reset email', { email });

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      
      await this.sendEmail({
        to: email,
        subject: 'Reset your password',
        html: `
          <h2>Reset your password</h2>
          <p>Please click the link below to reset your password:</p>
          <a href="${resetUrl}">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
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
   * Send welcome email
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
   * Send notification email
   */
  async sendNotificationEmail(email: string, subject: string, message: string): Promise<void> {
    try {
      logger.info('Sending notification email', { email, subject });

      await this.sendEmail({
        to: email,
        subject: subject,
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

