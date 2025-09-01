/**
 * Authentication test utilities
 * Provides helpers for mocking JWT tokens and authentication-related functionality
 */

// Use require for jsonwebtoken to match the approach in the main codebase
const jwt = require('jsonwebtoken');
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a mock JWT token with custom payload
 * 
 * @param payload - The payload to include in the token
 * @param secret - The secret to use for signing (defaults to 'test-secret')
 * @param expiresIn - Token expiration time (defaults to '1h')
 */
export const generateMockToken = (
  payload: object = { id: uuidv4() },
  secret: string = 'test-secret',
  expiresIn: string = '1h'
): string => {
  // Match the approach used in the actual implementation (jwt.ts)
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Mock authentication middleware for testing protected routes
 * 
 * @param user - The user object to attach to the request (default is a generic user)
 */
export const createMockAuthMiddleware = (user: any = { id: uuidv4(), role: 'user' }) => {
  return (req: any, _res: any, next: any) => {
    req.user = user;
    next();
  };
};

/**
 * Creates a mock admin user for testing admin-protected routes
 */
export const createMockAdminUser = (overrides = {}) => {
  return {
    id: uuidv4(),
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    ...overrides
  };
};

/**
 * Creates a mock regular user for testing user-level permissions
 */
export const createMockRegularUser = (overrides = {}) => {
  return {
    id: uuidv4(),
    email: 'user@example.com',
    name: 'Regular User',
    role: 'user',
    ...overrides
  };
};
