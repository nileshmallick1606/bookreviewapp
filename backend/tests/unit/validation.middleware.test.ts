import { describe, it, expect, jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { validate } from '../../src/middlewares/validation.middleware';
import { HttpStatus } from '../../src/config/apiStandards';

// Mock Express request, response, and next function
const mockRequest = (body: any = {}) => ({ body } as Request);
const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};
const mockNext = jest.fn() as NextFunction;

describe('Validation Middleware', () => {
  it('should call next() when validation passes', async () => {
    // Setup
    const req = mockRequest({ email: 'valid@example.com' });
    const res = mockResponse();
    const validations = [
      body('email').isEmail().withMessage('Must be a valid email')
    ];
    const validateMiddleware = validate(validations);
    
    // Execute
    await validateMiddleware(req, res, mockNext);
    
    // Assert
    expect(mockNext).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should return validation error when validation fails', async () => {
    // Setup
    const req = mockRequest({ email: 'invalid-email' });
    const res = mockResponse();
    const validations = [
      body('email').isEmail().withMessage('Must be a valid email')
    ];
    const validateMiddleware = validate(validations);
    
    // Execute
    await validateMiddleware(req, res, mockNext);
    
    // Assert
    expect(mockNext).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        data: null,
        error: expect.objectContaining({
          code: HttpStatus.UNPROCESSABLE_ENTITY,
          message: 'Validation failed',
          details: expect.objectContaining({
            email: 'Must be a valid email'
          })
        })
      })
    );
  });

  it('should handle multiple validation errors', async () => {
    // Setup
    const req = mockRequest({ email: 'invalid-email', age: 15 });
    const res = mockResponse();
    const validations = [
      body('email').isEmail().withMessage('Must be a valid email'),
      body('age').isInt({ min: 18 }).withMessage('Must be at least 18 years old')
    ];
    const validateMiddleware = validate(validations);
    
    // Execute
    await validateMiddleware(req, res, mockNext);
    
    // Assert
    expect(mockNext).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        data: null,
        error: expect.objectContaining({
          code: HttpStatus.UNPROCESSABLE_ENTITY,
          message: 'Validation failed',
          details: expect.objectContaining({
            email: 'Must be a valid email',
            age: 'Must be at least 18 years old'
          })
        })
      })
    );
  });
});
