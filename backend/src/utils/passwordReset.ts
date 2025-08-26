// src/utils/passwordReset.ts
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

interface ResetToken {
  token: string;
  userId: string;
  email: string;
  expiresAt: string; // ISO string
  used: boolean;
}

const TOKENS_DIR = path.resolve(__dirname, '../../data/tokens');
const ensureTokensDirectory = async (): Promise<void> => {
  try {
    await fs.mkdir(TOKENS_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating tokens directory:', error);
    throw new Error('Failed to initialize token storage');
  }
};

/**
 * Generate a secure random token for password reset
 * @returns A secure random token string
 */
export const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Create and store a password reset token
 * @param userId User ID
 * @param email User email
 * @returns The generated token
 */
export const createPasswordResetToken = async (
  userId: string,
  email: string
): Promise<string> => {
  try {
    await ensureTokensDirectory();
    
    // Generate a secure random token
    const token = generateResetToken();
    
    // Create token object with 24-hour expiration
    const resetToken: ResetToken = {
      token,
      userId,
      email,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      used: false
    };
    
    // Store token in file system
    const tokenFilePath = path.resolve(TOKENS_DIR, `${token}.json`);
    await fs.writeFile(tokenFilePath, JSON.stringify(resetToken, null, 2));
    
    return token;
  } catch (error) {
    console.error('Error creating password reset token:', error);
    throw new Error('Failed to create password reset token');
  }
};

/**
 * Validate a password reset token
 * @param token The token to validate
 * @returns The token data if valid, null otherwise
 */
export const validateResetToken = async (
  token: string
): Promise<ResetToken | null> => {
  try {
    await ensureTokensDirectory();
    
    // Check if token file exists
    const tokenFilePath = path.resolve(TOKENS_DIR, `${token}.json`);
    try {
      // Read token file
      const tokenData = JSON.parse(await fs.readFile(tokenFilePath, 'utf-8')) as ResetToken;
      
      // Check if token is expired
      const expiresAt = new Date(tokenData.expiresAt);
      const now = new Date();
      
      if (expiresAt < now || tokenData.used) {
        return null;
      }
      
      return tokenData;
    } catch (error) {
      // Token file doesn't exist or is invalid
      return null;
    }
  } catch (error) {
    console.error('Error validating reset token:', error);
    throw new Error('Failed to validate reset token');
  }
};

/**
 * Mark a token as used after successful password reset
 * @param token The token to invalidate
 */
export const markTokenAsUsed = async (token: string): Promise<void> => {
  try {
    await ensureTokensDirectory();
    
    // Check if token file exists
    const tokenFilePath = path.resolve(TOKENS_DIR, `${token}.json`);
    try {
      // Read token file
      const tokenData = JSON.parse(await fs.readFile(tokenFilePath, 'utf-8')) as ResetToken;
      
      // Mark as used
      tokenData.used = true;
      
      // Write updated token back to file
      await fs.writeFile(tokenFilePath, JSON.stringify(tokenData, null, 2));
    } catch (error) {
      // Token file doesn't exist or is invalid
      throw new Error('Invalid token');
    }
  } catch (error) {
    console.error('Error marking token as used:', error);
    throw new Error('Failed to update token status');
  }
};
