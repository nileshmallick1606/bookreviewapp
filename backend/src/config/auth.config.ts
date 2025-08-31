/**
 * JWT Authentication Configuration and Types
 * This file defines the structure of JWT tokens and related authentication types.
 */

/**
 * JWT payload structure
 */
export interface JwtPayload {
  // User identifier
  id: string;
  
  // User email (useful for token refresh and verification)
  email: string;
  
  // User display name (optional, for convenience)
  name?: string;
  
  // User roles (for role-based authorization)
  roles?: string[];
  
  // Token type: 'access' or 'refresh'
  type: 'access' | 'refresh';
  
  // Issued at timestamp
  iat: number;
  
  // Expiration timestamp
  exp: number;
}

/**
 * JWT configuration
 */
export const jwtConfig = {
  // Access token settings
  accessToken: {
    secret: process.env.JWT_ACCESS_SECRET || 'access-secret-key-change-in-production',
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '60m', // 60 minutes
  },
  
  // Refresh token settings
  refreshToken: {
    secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key-change-in-production',
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d', // 7 days
  },
  
  // Cookie settings
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: 60 * 60 * 1000, // 60 minutes in milliseconds
  },
  
  // Refresh token cookie settings (longer lifespan)
  refreshCookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/api/v1/auth/refresh', // Limited path for security
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  }
};

/**
 * User authentication types
 */
export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
}

/**
 * Token blacklist TTL in seconds
 * Should match the maximum token lifetime
 */
export const TOKEN_BLACKLIST_TTL = 7 * 24 * 60 * 60; // 7 days in seconds
