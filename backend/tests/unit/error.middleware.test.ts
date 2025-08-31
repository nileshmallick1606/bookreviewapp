import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { ApiError, errorHandler } from '../../src/middlewares/error.middleware';
import { HttpStatus } from '../../src/config/apiStandards';

describe('Error Middleware', () => {
  // Mock Express objects
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  
  beforeEach(() => {
    // Mock console.error to prevent test output pollution
    console.error = jest.fn();
    
    // Setup request and response mocks
    req = {} as Partial<Request>;
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });
  
  describe('ApiError class', () => {
    it('should create an ApiError with the correct properties', () => {
      const error = new ApiError(HttpStatus.BAD_REQUEST, 'Invalid input', { field: 'error' });
      
      expect(error.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(error.message).toBe('Invalid input');
      expect(error.details).toEqual({ field: 'error' });
      expect(error.name).toBe('ApiError');
    });
  });
  
  describe('errorHandler middleware', () => {
    it('should handle ApiError instances', () => {
      const error = new ApiError(HttpStatus.NOT_FOUND, 'Resource not found');
      
      errorHandler(error, req as Request, res as Response, next);
      
      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        data: null,
        error: {
          code: HttpStatus.NOT_FOUND,
          message: 'Resource not found'
        }
      });
    });
    
    it('should handle ApiError with details', () => {
      const error = new ApiError(
        HttpStatus.UNPROCESSABLE_ENTITY, 
        'Validation failed',
        { email: 'Invalid email format' }
      );
      
      errorHandler(error, req as Request, res as Response, next);
      
      expect(res.status).toHaveBeenCalledWith(HttpStatus.UNPROCESSABLE_ENTITY);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        data: null,
        error: {
          code: HttpStatus.UNPROCESSABLE_ENTITY,
          message: 'Validation failed',
          details: { email: 'Invalid email format' }
        }
      });
    });
    
    it('should handle JSON syntax errors', () => {
      const syntaxError = new SyntaxError('Unexpected token');
      // Add body property to match Express SyntaxError from JSON parsing
      (syntaxError as any).body = '{ invalid json }';
      
      errorHandler(syntaxError, req as Request, res as Response, next);
      
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        data: null,
        error: {
          code: HttpStatus.BAD_REQUEST,
          message: 'Invalid JSON in request body'
        }
      });
    });
    
    it('should handle validation errors', () => {
      const validationError = new Error('Validation failed');
      validationError.name = 'ValidationError';
      (validationError as any).errors = {
        email: 'Email is required',
        password: 'Password is too short'
      };
      
      errorHandler(validationError, req as Request, res as Response, next);
      
      expect(res.status).toHaveBeenCalledWith(HttpStatus.UNPROCESSABLE_ENTITY);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        data: null,
        error: {
          code: HttpStatus.UNPROCESSABLE_ENTITY,
          message: 'Validation failed',
          details: {
            email: 'Email is required',
            password: 'Password is too short'
          }
        }
      });
    });
    
    it('should handle JWT errors', () => {
      const jwtError = new Error('Invalid token');
      jwtError.name = 'JsonWebTokenError';
      
      errorHandler(jwtError, req as Request, res as Response, next);
      
      expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        data: null,
        error: {
          code: HttpStatus.UNAUTHORIZED,
          message: 'Invalid authentication token'
        }
      });
    });
    
    it('should handle token expiration errors', () => {
      const expiredError = new Error('Token expired');
      expiredError.name = 'TokenExpiredError';
      
      errorHandler(expiredError, req as Request, res as Response, next);
      
      expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        data: null,
        error: {
          code: HttpStatus.UNAUTHORIZED,
          message: 'Authentication token expired'
        }
      });
    });
    
    it('should handle generic errors', () => {
      const genericError = new Error('Something went wrong');
      
      errorHandler(genericError, req as Request, res as Response, next);
      
      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        data: null,
        error: {
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Something went wrong'
        }
      });
    });
  });
});
