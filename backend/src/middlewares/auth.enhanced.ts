import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { isTokenBlacklisted } from '../utils/tokenBlacklist';
import { JwtPayload } from '../config/auth.config';
import { HttpStatus, errorResponse } from '../config/apiStandards';

// Note: We don't redefine the Request.user property here since it's already defined in auth.middleware.ts
// Instead, we'll cast JwtPayload to match the expected user structure

/**
 * Authentication middleware
 * Verifies the JWT token and attaches the user to the request
 * 
 * @param options - Optional configuration
 * @returns Express middleware
 */
export const authenticate = (options?: {
  optional?: boolean;  // If true, request proceeds even without authentication
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get token from cookies
      const token = req.cookies?.jwt;

      // If token is missing
      if (!token) {
        // If authentication is optional, proceed without user
        if (options?.optional) {
          return next();
        }
        
        return res.status(HttpStatus.UNAUTHORIZED).json(
          errorResponse(
            HttpStatus.UNAUTHORIZED,
            'Authentication required'
          )
        );
      }

      // Check if token is blacklisted (logged out)
      const isBlacklisted = await isTokenBlacklisted(token);
      if (isBlacklisted) {
        // If authentication is optional, proceed without user
        if (options?.optional) {
          return next();
        }
        
        return res.status(HttpStatus.UNAUTHORIZED).json(
          errorResponse(
            HttpStatus.UNAUTHORIZED,
            'Token has been revoked'
          )
        );
      }

      // Verify token
      try {
        const payload = await verifyToken<JwtPayload>(token);
        
        if (!payload) {
          // If authentication is optional, proceed without user
          if (options?.optional) {
            return next();
          }
          
          return res.status(HttpStatus.UNAUTHORIZED).json(
            errorResponse(
              HttpStatus.UNAUTHORIZED,
              'Invalid or expired token'
            )
          );
        }
        
        // Attach user to request with the required properties
        req.user = {
          id: payload.id,
          email: payload.email,
          name: payload.name || payload.email.split('@')[0] // Provide a fallback for name
        };
        
        // Store roles in request for authorization middleware
        (req as any).userRoles = payload.roles || [];
        
        next();
      } catch (err) {
        // If authentication is optional, proceed without user
        if (options?.optional) {
          return next();
        }
        
        return res.status(HttpStatus.UNAUTHORIZED).json(
          errorResponse(
            HttpStatus.UNAUTHORIZED,
            'Invalid or expired token'
          )
        );
      }
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Role-based authorization middleware
 * Checks if the authenticated user has the required roles
 * 
 * @param roles - Array of roles allowed to access the resource
 * @returns Express middleware
 */
export const authorize = (roles: string[]) => {
  return (req: Request & { userRoles?: string[] }, res: Response, next: NextFunction) => {
    // User must be authenticated first
    if (!req.user) {
      return res.status(HttpStatus.UNAUTHORIZED).json(
        errorResponse(
          HttpStatus.UNAUTHORIZED,
          'Authentication required'
        )
      );
    }

    // Check if user has any of the required roles
    const userRoles = (req as any).userRoles || [];
    const hasRole = roles.some(role => userRoles.includes(role));

    if (!hasRole) {
      return res.status(HttpStatus.FORBIDDEN).json(
        errorResponse(
          HttpStatus.FORBIDDEN,
          'Permission denied'
        )
      );
    }

    next();
  };
};
