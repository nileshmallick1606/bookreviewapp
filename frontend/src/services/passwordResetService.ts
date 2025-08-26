// src/services/passwordResetService.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

/**
 * Request a password reset email
 * @param email The email address to send the reset link to
 * @returns The response data with message
 */
export const requestPasswordReset = async (email: string) => {
  try {
    const response = await axios.post(`${API_URL}/auth/password-reset`, { email });
    return response.data.data;
  } catch (error) {
    console.error('Error requesting password reset:', error);
    throw error;
  }
};

/**
 * Validate a password reset token
 * @param token The token to validate
 * @returns The response data with email and message
 */
export const validatePasswordResetToken = async (token: string) => {
  try {
    const response = await axios.get(`${API_URL}/auth/password-reset/${token}`);
    return response.data.data;
  } catch (error) {
    console.error('Error validating reset token:', error);
    throw error;
  }
};

/**
 * Reset a password using a token
 * @param token The reset token
 * @param password The new password
 * @returns The response data with success message
 */
export const resetPassword = async (token: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/auth/password-reset/${token}`, { password });
    return response.data.data;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};
