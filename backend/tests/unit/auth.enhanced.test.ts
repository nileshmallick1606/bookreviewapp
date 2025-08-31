import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../../src/middlewares/auth.enhanced';
import { verifyToken } from '../../src/utils/jwt';
import { isTokenBlacklisted } from '../../src/utils/tokenBlacklist';
import { JwtPayload } from '../../src/config/auth.config';
import { HttpStatus } from '../../src/config/apiStandards';

// Mock dependencies
jest.mock('../../src/utils/jwt', () => ({
  verifyToken: jest.fn(),
}));

jest.mock('../../src/utils/tokenBlacklist', () => ({
  isTokenBlacklisted: jest.fn(),
}));

describe('Enhanced Authentication Middleware', () => {
  // Mock Express objects
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup request and response mocks
    req = {
      cookies: {},
      user: undefined,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();

    // Default mock implementations
    (verifyToken as jest.Mock).mockResolvedValue({
      id: 'user-id',
      email: 'user@example.com',
      roles: ['user'],
      type: 'access',
      iat: 1630000000,
      exp: 1630010000,
    });
    (isTokenBlacklisted as jest.Mock).mockResolvedValue(false);
  });

  describe('authenticate middleware', () => {
    it('should return 401 if no token provided', async () => {
      // Execute middleware
      await authenticate()(req as Request, res as Response, next);

      // Assert response
      expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        status: 'error',
        error: expect.objectContaining({
          code: HttpStatus.UNAUTHORIZED,
          message: 'Authentication required',
        }),
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should proceed without user if authentication is optional and no token', async () => {
      // Execute middleware with optional flag
      await authenticate({ optional: true })(req as Request, res as Response, next);

      // Assert that middleware calls next without setting user
      expect(next).toHaveBeenCalled();
      expect(req.user).toBeUndefined();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 401 if token is blacklisted', async () => {
      // Setup
      req.cookies = { jwt: 'blacklisted-token' };
      (isTokenBlacklisted as jest.Mock).mockResolvedValue(true);

      // Execute middleware
      await authenticate()(req as Request, res as Response, next);

      // Assert response
      expect(isTokenBlacklisted).toHaveBeenCalledWith('blacklisted-token');
      expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.objectContaining({
          message: 'Token has been revoked',
        }),
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should attach user to request if token is valid', async () => {
      // Setup
      req.cookies = { jwt: 'valid-token' };
      const mockUser = {
        id: 'user-id',
        email: 'user@example.com',
        roles: ['user'],
        type: 'access',
        iat: 1630000000,
        exp: 1630010000,
      };
      (verifyToken as jest.Mock).mockResolvedValue(mockUser);

      // Execute middleware
      await authenticate()(req as Request, res as Response, next);

      // Assert user is attached
      expect(verifyToken).toHaveBeenCalledWith('valid-token');
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });

    it('should return 401 if token verification fails', async () => {
      // Setup
      req.cookies = { jwt: 'invalid-token' };
      (verifyToken as jest.Mock).mockRejectedValue(new Error('Invalid token'));

      // Execute middleware
      await authenticate()(req as Request, res as Response, next);

      // Assert response
      expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.objectContaining({
          message: 'Invalid or expired token',
        }),
      }));
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('authorize middleware', () => {
    it('should return 401 if user is not authenticated', () => {
      // Execute middleware
      authorize(['admin'])(req as Request, res as Response, next);

      // Assert response
      expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.objectContaining({
          message: 'Authentication required',
        }),
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if user does not have required role', () => {
      // Setup - user with 'user' role trying to access 'admin' resource
      req.user = {
        id: 'user-id',
        email: 'user@example.com',
        roles: ['user'],
        type: 'access',
        iat: 1630000000,
        exp: 1630010000,
      } as JwtPayload;

      // Execute middleware
      authorize(['admin'])(req as Request, res as Response, next);

      // Assert response
      expect(res.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.objectContaining({
          message: 'Permission denied',
        }),
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next() if user has required role', () => {
      // Setup - user with 'admin' role
      req.user = {
        id: 'admin-id',
        email: 'admin@example.com',
        roles: ['user', 'admin'],
        type: 'access',
        iat: 1630000000,
        exp: 1630010000,
      } as JwtPayload;

      // Execute middleware
      authorize(['admin'])(req as Request, res as Response, next);

      // Assert middleware proceeds
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should call next() if user has any of the required roles', () => {
      // Setup - user with 'editor' role
      req.user = {
        id: 'editor-id',
        email: 'editor@example.com',
        roles: ['user', 'editor'],
        type: 'access',
        iat: 1630000000,
        exp: 1630010000,
      } as JwtPayload;

      // Execute middleware with multiple allowed roles
      authorize(['admin', 'editor'])(req as Request, res as Response, next);

      // Assert middleware proceeds
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
