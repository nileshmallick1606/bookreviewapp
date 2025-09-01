/**
 * Unit tests for Auth Configuration
 */

import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import * as authConfig from '../../../src/config/auth.config';

describe('Auth Configuration', () => {
  // Save original environment
  const originalEnv = process.env;
  
  beforeEach(() => {
    // Reset the environment variables before each test
    process.env = { ...originalEnv };
    jest.resetModules();
  });
  
  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });
  
  describe('JWT Configuration', () => {
    it('should use environment variables for access token when available', () => {
      // Set environment variables
      process.env.JWT_ACCESS_SECRET = 'test-jwt-access-secret';
      process.env.JWT_ACCESS_EXPIRES_IN = '2h';
      
      // Re-import to get fresh values
      const freshConfig = require('../../../src/config/auth.config');
      
      // Test that config uses environment variables
      expect(freshConfig.jwtConfig.accessToken.secret).toBe('test-jwt-access-secret');
      expect(freshConfig.jwtConfig.accessToken.expiresIn).toBe('2h');
    });
    
    it('should use environment variables for refresh token when available', () => {
      // Set environment variables
      process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';
      process.env.JWT_REFRESH_EXPIRES_IN = '14d';
      
      // Re-import to get fresh values
      const freshConfig = require('../../../src/config/auth.config');
      
      // Test that config uses environment variables
      expect(freshConfig.jwtConfig.refreshToken.secret).toBe('test-jwt-refresh-secret');
      expect(freshConfig.jwtConfig.refreshToken.expiresIn).toBe('14d');
    });
    
    it('should use default values when environment variables are not available', () => {
      // Clear specific environment variables
      delete process.env.JWT_ACCESS_SECRET;
      delete process.env.JWT_ACCESS_EXPIRES_IN;
      delete process.env.JWT_REFRESH_SECRET;
      delete process.env.JWT_REFRESH_EXPIRES_IN;
      
      // Re-import to get fresh values
      const freshConfig = require('../../../src/config/auth.config');
      
      // Test default values
      expect(freshConfig.jwtConfig.accessToken.secret).toBeDefined();
      expect(typeof freshConfig.jwtConfig.accessToken.secret).toBe('string');
      expect(freshConfig.jwtConfig.accessToken.expiresIn).toBeDefined();
      
      expect(freshConfig.jwtConfig.refreshToken.secret).toBeDefined();
      expect(typeof freshConfig.jwtConfig.refreshToken.secret).toBe('string');
      expect(freshConfig.jwtConfig.refreshToken.expiresIn).toBeDefined();
    });
  });

  describe('Cookie Configuration', () => {
    it('should have httpOnly setting defined', () => {
      expect(authConfig.jwtConfig.cookie.httpOnly).toBeDefined();
    });
  });
  
  describe('JwtPayload Interface', () => {
    it('should define the JwtPayload interface with required properties', () => {
      // Create a type test function to verify interface
      const isValidJwtPayload = (payload: authConfig.JwtPayload): boolean => {
        return (
          typeof payload.id === 'string' &&
          typeof payload.email === 'string' &&
          ['access', 'refresh'].includes(payload.type) &&
          typeof payload.iat === 'number' &&
          typeof payload.exp === 'number'
        );
      };
      
      // Test with a sample payload
      const samplePayload: authConfig.JwtPayload = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        roles: ['user'],
        type: 'access',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600
      };
      
      expect(isValidJwtPayload(samplePayload)).toBe(true);
    });
  });
});
