// src/middlewares/auth.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { isTokenBlacklisted } from '../utils/tokenBlacklist';

// Extended Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Interface for JWT payload
 */
interface JwtPayload {
  id: string;
  email: string;
  name: string;
}

/**
 * Middleware to protect routes requiring authentication
 * Verifies the JWT token and attaches the user to the request
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from cookies
    const token = req.cookies?.jwt;

    if (!token) {
      return res.status(401).json({
        status: 'error',
        data: null,
        error: {
          code: 401,
          message: 'Authentication required'
        }
      });
    }

    // Check if token is blacklisted
    const isBlacklisted = await isTokenBlacklisted(token);
    if (isBlacklisted) {
      return res.status(401).json({
        status: 'error',
        data: null,
        error: {
          code: 401,
          message: 'Token has been revoked'
        }
      });
    }

    // Verify token
    const decoded = verifyToken<JwtPayload>(token);

    if (!decoded) {
      return res.status(401).json({
        status: 'error',
        data: null,
        error: {
          code: 401,
          message: 'Invalid or expired token'
        }
      });
    }

    // Attach user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name
    };

    next();
  } catch (error) {
    next(error);
  }
};
