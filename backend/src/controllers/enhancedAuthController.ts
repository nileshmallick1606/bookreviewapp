// src/controllers/enhancedAuthController.ts
import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { BaseController } from './base.controller';
import { User, createUser } from '../models/user';
import { generateToken, setTokenCookie, verifyToken } from '../utils/jwt';
import { jwtConfig } from '../config/auth.config';
import { findUserByEmail, createNewUser, getUserById } from '../services/userService';
import { verifyPassword } from '../utils/password';
import { HttpStatus } from '../config/apiStandards';

/**
 * Auth validation rules
 */
export const authValidation = {
  register: [
    body('email')
      .isEmail()
      .withMessage('Email must be a valid email address')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    body('name')
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('genrePreferences')
      .optional()
      .isArray()
      .withMessage('Genre preferences must be an array'),
  ],
  login: [
    body('email')
      .isEmail()
      .withMessage('Email must be a valid email address')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
  ],
  refreshToken: [
    body('refreshToken')
      .isString()
      .withMessage('Refresh token is required'),
  ],
};

/**
 * Enhanced Auth Controller with standardized responses
 */
export class EnhancedAuthController {
  /**
   * Helper method to send error response
   */
  protected static sendError(
    res: Response,
    statusCode: number,
    message: string,
    details?: Record<string, any>
  ): void {
    res.status(statusCode).json({
      status: 'error',
      error: {
        code: statusCode,
        message,
        details
      },
      data: null
    });
  }
  
  /**
   * Helper method to send success response
   */
  protected static sendSuccess<T>(
    res: Response,
    data: T,
    statusCode: number = HttpStatus.OK
  ): void {
    res.status(statusCode).json({
      status: 'success',
      data,
      error: null
    });
  }
  /**
   * Register a new user
   */
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name, genrePreferences } = req.body;

      // Check if user already exists
      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        return this.sendError(
          res,
          HttpStatus.CONFLICT,
          'User with this email already exists'
        );
      }

      // Create user
      const user = await createNewUser({
        email,
        password,
        name,
        genrePreferences
      });

      // Generate token
      const token = generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
        type: 'access',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
      });

      // Set token in cookie
      setTokenCookie(res, token);

      return this.sendSuccess(
        res,
        {
          user: {
            id: user.id,
            email: user.email,
            name: user.name
          }
        },
        HttpStatus.CREATED
      );
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Login a user
   */
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await findUserByEmail(email);
      if (!user) {
        return this.sendError(
          res, 
          HttpStatus.UNAUTHORIZED,
          'Invalid email or password'
        );
      }

      // Verify password
      if (!user.password) {
        return this.sendError(
          res,
          HttpStatus.UNAUTHORIZED,
          'This account cannot be accessed with password login'
        );
      }
      
      const isPasswordValid = await verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return this.sendError(
          res,
          HttpStatus.UNAUTHORIZED,
          'Invalid email or password'
        );
      }

      // Generate token
      const token = generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
        type: 'access',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
      });

      // Set token in cookie
      setTokenCookie(res, token);

      return this.sendSuccess(res, {
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Logout the current user
   */
  static logout(req: Request, res: Response) {
    res.clearCookie('jwt');
    return this.sendSuccess(res, { message: 'Successfully logged out' });
  }

  /**
   * Get the current logged in user's profile
   */
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      // The user ID will come from the authenticated request
      // This assumes you've set up authentication middleware
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return this.sendError(
          res,
          HttpStatus.UNAUTHORIZED,
          'Not authenticated'
        );
      }
      
      const user = await getUserById(userId);
      
      if (!user) {
        return this.sendError(
          res,
          HttpStatus.NOT_FOUND,
          'User not found'
        );
      }
      
      // Don't send the password hash in the response
      const { password, ...userWithoutPassword } = user;
      
      return this.sendSuccess(res, { user: userWithoutPassword });
    } catch (error) {
      return next(error);
    }
  }
  
  /**
   * Refresh the user's access token
   */
  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return this.sendError(
          res,
          HttpStatus.BAD_REQUEST,
          'Refresh token is required'
        );
      }
      
      // Verify the refresh token
      try {
        interface TokenPayload {
          id: string;
          email: string;
          type: 'access' | 'refresh';
          name?: string;
          iat: number;
          exp: number;
        }
        
        const decoded = verifyToken<TokenPayload>(refreshToken);
        
        // Check if token is valid
        if (!decoded) {
          return this.sendError(
            res,
            HttpStatus.UNAUTHORIZED,
            'Invalid token'
          );
        }
        
        // Check if it's a refresh token
        if (decoded.type !== 'refresh') {
          return this.sendError(
            res,
            HttpStatus.UNAUTHORIZED,
            'Invalid token type'
          );
        }
        
        // Get the user
        const user = await getUserById(decoded.id);
        if (!user) {
          return this.sendError(
            res,
            HttpStatus.NOT_FOUND,
            'User not found'
          );
        }
        
        // Generate a new access token
        const newToken = generateToken({
          id: user.id,
          email: user.email,
          name: user.name,
          type: 'access',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
        });
        
        // Set the new token in cookie
        setTokenCookie(res, newToken);
        
        return this.sendSuccess(res, {
          user: {
            id: user.id,
            email: user.email,
            name: user.name
          }
        });
      } catch (error) {
        return this.sendError(
          res,
          HttpStatus.UNAUTHORIZED,
          'Invalid or expired refresh token'
        );
      }
    } catch (error) {
      return next(error);
    }
  }
}
