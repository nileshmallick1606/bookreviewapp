import { Request, Response, NextFunction } from 'express';
import { errorResponse, HttpStatus } from '../config/apiStandards';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  statusCode: number;
  details?: Record<string, any>;

  constructor(statusCode: number, message: string, details?: Record<string, any>) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'ApiError';
  }
}

/**
 * Global error handling middleware
 * Converts various error types to standardized API responses
 */
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  // Default to internal server error
  let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
  let message = 'Internal server error';
  let details: Record<string, any> | undefined;

  // Handle specific error types
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof SyntaxError && 'body' in err) {
    // JSON parse errors
    statusCode = HttpStatus.BAD_REQUEST;
    message = 'Invalid JSON in request body';
  } else if (err.name === 'ValidationError') {
    // Mongoose validation errors
    statusCode = HttpStatus.UNPROCESSABLE_ENTITY;
    message = 'Validation failed';
    // Extract details if available
    details = (err as any).errors;
  } else if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    // JWT errors
    statusCode = HttpStatus.UNAUTHORIZED;
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    // JWT expiration
    statusCode = HttpStatus.UNAUTHORIZED;
    message = 'Authentication token expired';
  }

  // Send standardized error response
  res.status(statusCode).json(errorResponse(statusCode, message, details));
};
