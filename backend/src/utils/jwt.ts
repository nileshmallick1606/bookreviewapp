// src/utils/jwt.ts
import { Response } from 'express';
const jwt = require('jsonwebtoken');

// JWT Secret Key - should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
// Define expiration time in seconds (3600 = 1 hour)
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// Cookie configuration
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 60 * 60 * 1000, // 60 minutes in milliseconds
  path: '/'
} as const;

/**
 * Generate a JWT token for a user
 * @param payload User data to encode in the token
 * @returns JWT token string
 */
export const generateToken = (payload: Record<string, any>): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Set JWT token in HTTP-only cookie
 * @param res Express response object
 * @param token JWT token string
 */
export const setTokenCookie = (res: Response, token: string): void => {
  res.cookie('jwt', token, COOKIE_OPTIONS);
};

/**
 * Verify and decode a JWT token
 * @param token JWT token string to verify
 * @returns Decoded token payload or null if invalid
 */
export const verifyToken = <T>(token: string): T | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as T;
  } catch (error) {
    return null;
  }
};

/**
 * Clear the JWT cookie
 * @param res Express response object
 */
export const clearTokenCookie = (res: Response): void => {
  res.cookie('jwt', '', { ...COOKIE_OPTIONS, maxAge: 0 });
};
