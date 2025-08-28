import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticationError } from '../utils/errors';

// Extend Express Request to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
      };
    }
  }
}

/**
 * Optional authentication middleware - tries to authenticate but continues even if no token
 * Used for endpoints that work with or without authentication but provide enhanced functionality when authenticated
 */
export const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Get token from cookies or Authorization header
    const token = req.cookies?.jwt || 
                 (req.headers.authorization?.startsWith('Bearer ') && 
                  req.headers.authorization.split(' ')[1]);
    
    // If no token, just continue without setting user
    if (!token) {
      return next();
    }
    
    // Verify token
    try {
      const secret = process.env.JWT_SECRET || 'default_secret_for_development';
      const decoded = jwt.verify(token, secret) as {
        id: string;
        email: string;
        name: string;
      };
      
      // Attach user to request
      req.user = {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name
      };
    } catch (tokenError) {
      // Token is invalid, but we still continue without setting user
      console.warn('Invalid token in optional auth:', tokenError);
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Required authentication middleware
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Get token from cookies or Authorization header
    const token = req.cookies?.jwt || 
                 (req.headers.authorization?.startsWith('Bearer ') && 
                  req.headers.authorization.split(' ')[1]);
    
    if (!token) {
      res.status(401).json({
        status: 'error',
        error: { code: 401, message: 'Authentication required' },
        data: null
      });
      return;
    }
    
    // Verify token
    const secret = process.env.JWT_SECRET || 'default_secret_for_development';
    const decoded = jwt.verify(token, secret) as {
      id: string;
      email: string;
      name: string;
    };
    
    // Attach user to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    res.status(401).json({
      status: 'error',
      error: { code: 401, message: 'Invalid or expired token' },
      data: null
    });
  }
};
