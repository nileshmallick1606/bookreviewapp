import { Request, Response } from 'express';
import { 
  ApiResponse, 
  successResponse, 
  errorResponse, 
  HttpStatus, 
  PaginationMeta,
  createPaginationMeta
} from '../config/apiStandards';

/**
 * Base Controller class with helper methods for standardized responses
 * All controllers should extend this class
 */
export abstract class BaseController {
  /**
   * Sends a success response with optional data and metadata
   * 
   * @param res - Express Response object
   * @param data - Data to include in the response
   * @param statusCode - HTTP status code (defaults to 200 OK)
   * @param meta - Optional metadata (e.g., pagination)
   */
  protected sendSuccess<T>(
    res: Response,
    data: T,
    statusCode: number = HttpStatus.OK,
    meta?: { pagination?: PaginationMeta }
  ): void {
    res.status(statusCode).json(successResponse(data, meta));
  }

  /**
   * Sends an error response
   * 
   * @param res - Express Response object
   * @param statusCode - HTTP status code
   * @param message - Error message
   * @param details - Optional error details
   */
  protected sendError(
    res: Response,
    statusCode: number,
    message: string,
    details?: Record<string, any>
  ): void {
    res.status(statusCode).json(errorResponse(statusCode, message, details));
  }

  /**
   * Creates pagination metadata from request query parameters and total count
   * 
   * @param req - Express Request object
   * @param totalItems - Total number of items
   * @param defaultLimit - Default page size (defaults to 10)
   * @returns Pagination metadata
   */
  protected createPagination(
    req: Request,
    totalItems: number,
    defaultLimit: number = 10
  ): PaginationMeta {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || defaultLimit);
    
    return createPaginationMeta(page, limit, totalItems);
  }

  /**
   * Sends a created (201) response with the created resource
   * 
   * @param res - Express Response object
   * @param data - The created resource
   */
  protected sendCreated<T>(res: Response, data: T): void {
    this.sendSuccess(res, data, HttpStatus.CREATED);
  }

  /**
   * Sends a no content (204) response
   * 
   * @param res - Express Response object
   */
  protected sendNoContent(res: Response): void {
    res.status(HttpStatus.NO_CONTENT).end();
  }

  /**
   * Sends a bad request (400) error response
   * 
   * @param res - Express Response object
   * @param message - Error message
   * @param details - Optional error details
   */
  protected sendBadRequest(
    res: Response,
    message: string = 'Bad request',
    details?: Record<string, any>
  ): void {
    this.sendError(res, HttpStatus.BAD_REQUEST, message, details);
  }

  /**
   * Sends an unauthorized (401) error response
   * 
   * @param res - Express Response object
   * @param message - Error message
   */
  protected sendUnauthorized(
    res: Response,
    message: string = 'Authentication required'
  ): void {
    this.sendError(res, HttpStatus.UNAUTHORIZED, message);
  }

  /**
   * Sends a forbidden (403) error response
   * 
   * @param res - Express Response object
   * @param message - Error message
   */
  protected sendForbidden(
    res: Response,
    message: string = 'Permission denied'
  ): void {
    this.sendError(res, HttpStatus.FORBIDDEN, message);
  }

  /**
   * Sends a not found (404) error response
   * 
   * @param res - Express Response object
   * @param message - Error message
   */
  protected sendNotFound(
    res: Response,
    message: string = 'Resource not found'
  ): void {
    this.sendError(res, HttpStatus.NOT_FOUND, message);
  }

  /**
   * Sends a conflict (409) error response
   * 
   * @param res - Express Response object
   * @param message - Error message
   * @param details - Optional error details
   */
  protected sendConflict(
    res: Response,
    message: string = 'Resource conflict',
    details?: Record<string, any>
  ): void {
    this.sendError(res, HttpStatus.CONFLICT, message, details);
  }

  /**
   * Sends an internal server error (500) response
   * 
   * @param res - Express Response object
   * @param error - Error object or message
   */
  protected sendServerError(
    res: Response,
    error: Error | string = 'Internal server error'
  ): void {
    const message = error instanceof Error ? error.message : error;
    console.error(error);
    this.sendError(res, HttpStatus.INTERNAL_SERVER_ERROR, message);
  }
}
