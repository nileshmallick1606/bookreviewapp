// src/controllers/authController.ts
import { Request, Response, NextFunction } from 'express';
import { createNewUser, findUserByEmail } from '../services/userService';
import { validateEmail, validateName } from '../utils/validation';
import { validatePasswordStrength, verifyPassword } from '../utils/password';
import { toUserResponse } from '../models/user';
import { generateToken, setTokenCookie, clearTokenCookie, getTokenExpiration } from '../utils/jwt';
import { blacklistToken } from '../utils/tokenBlacklist';

/**
 * User registration controller
 * Validates input and creates a new user account
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, name } = req.body;
    
    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({
        status: 'error',
        data: null,
        error: {
          code: 400,
          message: emailValidation.message || 'Invalid email',
        }
      });
    }
    
    // Validate name
    const nameValidation = validateName(name);
    if (!nameValidation.isValid) {
      return res.status(400).json({
        status: 'error',
        data: null,
        error: {
          code: 400,
          message: nameValidation.message || 'Invalid name',
        }
      });
    }
    
    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        status: 'error',
        data: null,
        error: {
          code: 400,
          message: passwordValidation.message || 'Password is not strong enough',
        }
      });
    }
    
    // Check if email already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        status: 'error',
        data: null,
        error: {
          code: 409,
          message: 'Email is already registered',
        }
      });
    }
    
    // Create the user
    const user = await createNewUser({ email, password, name });
    
    // Return success response with user data (excluding password)
    return res.status(201).json({
      status: 'success',
      data: {
        user: toUserResponse(user),
        message: 'Registration successful'
      },
      error: null
    });
    
  } catch (error) {
    // Pass the error to the error handler middleware
    next(error);
  }
};

/**
 * User login controller
 * Authenticates user credentials and generates JWT token
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, rememberMe } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        data: null,
        error: {
          code: 400,
          message: 'Email and password are required'
        }
      });
    }
    
    // Find user by email
    const user = await findUserByEmail(email);
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({
        status: 'error',
        data: null,
        error: {
          code: 401,
          message: 'Invalid email or password'
        }
      });
    }
    
    // Check if user has a password (might be social login only)
    if (!user.password) {
      return res.status(401).json({
        status: 'error',
        data: null,
        error: {
          code: 401,
          message: 'This account requires social login'
        }
      });
    }
    
    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    
    // If password is invalid
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        data: null,
        error: {
          code: 401,
          message: 'Invalid email or password'
        }
      });
    }
    
    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name
    });
    
    // Set token in HTTP-only cookie
    setTokenCookie(res, token);
    
    // Return success response with user data
    return res.status(200).json({
      status: 'success',
      data: {
        user: toUserResponse(user),
        message: 'Login successful'
      },
      error: null
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * User logout controller
 * Clears the JWT token cookie and invalidates the token
 */
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get the token from cookies
    const token = req.cookies?.jwt;
    
    if (token) {
      // Get token expiration
      const expiration = getTokenExpiration(token);
      
      // Add token to blacklist
      if (expiration) {
        await blacklistToken(token, expiration);
      }
    }
    
    // Clear the JWT cookie
    clearTokenCookie(res);
    
    return res.status(200).json({
      status: 'success',
      data: {
        message: 'Logout successful'
      },
      error: null
    });
  } catch (error) {
    next(error);
  }
};
