// src/services/emailService.ts
import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';

// For development only - use a real email service in production
const createDevTransport = () => {
  return nodemailer.createTransport({
    host: 'localhost',
    port: 1025, // Default mailhog port
    ignoreTLS: true
  });
};

// For production - configure with real SMTP settings
const createProdTransport = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    }
  });
};

// Create appropriate transport based on environment
const transport = process.env.NODE_ENV === 'production' 
  ? createProdTransport() 
  : createDevTransport();

// Log email to file for development if email service is not available
const logEmailToFile = async (to: string, subject: string, html: string) => {
  try {
    const logsDir = path.resolve(__dirname, '../../logs/emails');
    await fs.mkdir(logsDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filePath = path.resolve(logsDir, `${timestamp}-${to}.html`);
    
    const content = `
      To: ${to}
      Subject: ${subject}
      Date: ${new Date().toISOString()}
      
      ${html}
    `;
    
    await fs.writeFile(filePath, content);
    console.log(`Email logged to ${filePath}`);
  } catch (error) {
    console.error('Error logging email to file:', error);
  }
};

/**
 * Send a password reset email
 * @param to Recipient email
 * @param resetToken Password reset token
 * @param resetUrl Base URL for reset link
 */
export const sendPasswordResetEmail = async (
  to: string,
  resetToken: string,
  resetUrl: string
): Promise<void> => {
  try {
    const resetLink = `${resetUrl}/auth/reset-password/${resetToken}`;
    
    // HTML email template
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Reset Your Password</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password for the BookReview platform. Click the link below to set a new password:</p>
        <p>
          <a 
            href="${resetLink}" 
            style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;"
          >
            Reset Password
          </a>
        </p>
        <p>This link will expire in 24 hours. If you didn't request a password reset, you can ignore this email.</p>
        <p>Thank you,<br>The BookReview Team</p>
      </div>
    `;

    try {
      // Send email
      await transport.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@bookreview.com',
        to,
        subject: 'Reset Your BookReview Password',
        html
      });
      console.log(`Password reset email sent to ${to}`);
    } catch (emailError) {
      console.warn('Failed to send email, logging to file instead:', emailError);
      await logEmailToFile(to, 'Reset Your BookReview Password', html);
    }
  } catch (error) {
    console.error('Error in sendPasswordResetEmail:', error);
    throw new Error('Failed to send password reset email');
  }
};
