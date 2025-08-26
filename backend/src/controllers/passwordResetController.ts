// src/controllers/passwordResetController.ts
import { Request, Response, NextFunction } from 'express';
import { findUserByEmail, updateUserPassword } from '../services/userService';
import { validateEmail } from '../utils/validation';
import { validatePasswordStrength } from '../utils/password';
import { 
  createPasswordResetToken,
  validateResetToken,
  markTokenAsUsed
} from '../utils/passwordReset';
import { sendPasswordResetEmail } from '../services/emailService';

/**
 * Request a password reset
 * Handle POST /api/v1/auth/password-reset
 */
export const requestPasswordReset = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    
    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({
        status: 'error',
        data: null,
        error: {
          code: 400,
          message: emailValidation.message || 'Invalid email'
        }
      });
    }
    
    // Find user by email
    const user = await findUserByEmail(email);
    
    // If user not found, still return success to prevent email enumeration
    if (!user) {
      return res.status(200).json({
        status: 'success',
        data: {
          message: 'If your email is registered, you will receive reset instructions shortly'
        },
        error: null
      });
    }
    
    // Generate reset token
    const token = await createPasswordResetToken(user.id, user.email);
    
    // Send reset email
    // Use the frontend URL from environment variable or default to localhost:3000
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    await sendPasswordResetEmail(user.email, token, frontendUrl);
    
    // Return success response
    return res.status(200).json({
      status: 'success',
      data: {
        message: 'If your email is registered, you will receive reset instructions shortly'
      },
      error: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Validate a password reset token
 * Handle GET /api/v1/auth/password-reset/:token
 */
export const validatePasswordResetToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.params;
    
    // Validate the token
    const tokenData = await validateResetToken(token);
    
    if (!tokenData) {
      return res.status(400).json({
        status: 'error',
        data: null,
        error: {
          code: 400,
          message: 'Invalid or expired password reset token'
        }
      });
    }
    
    // Return success response with email
    return res.status(200).json({
      status: 'success',
      data: {
        email: tokenData.email,
        message: 'Token is valid'
      },
      error: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset a user's password with a valid token
 * Handle POST /api/v1/auth/password-reset/:token
 */
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    // Validate the token
    const tokenData = await validateResetToken(token);
    
    if (!tokenData) {
      return res.status(400).json({
        status: 'error',
        data: null,
        error: {
          code: 400,
          message: 'Invalid or expired password reset token'
        }
      });
    }
    
    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        status: 'error',
        data: null,
        error: {
          code: 400,
          message: passwordValidation.message || 'Password is not strong enough'
        }
      });
    }
    
    // Update the user's password
    await updateUserPassword(tokenData.userId, password);
    
    // Mark token as used
    await markTokenAsUsed(token);
    
    // Return success response
    return res.status(200).json({
      status: 'success',
      data: {
        message: 'Password has been reset successfully'
      },
      error: null
    });
  } catch (error) {
    next(error);
  }
};
