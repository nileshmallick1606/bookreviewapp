import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Request, Response } from 'express';
import { BaseController } from '../../src/controllers/base.controller';
import { HttpStatus } from '../../src/config/apiStandards';

// Create a concrete implementation of the abstract BaseController
class TestController extends BaseController {
  public testSendSuccess<T>(res: Response, data: T, statusCode?: number, meta?: any) {
    this.sendSuccess(res, data, statusCode, meta);
  }
  
  public testSendError(res: Response, statusCode: number, message: string, details?: any) {
    this.sendError(res, statusCode, message, details);
  }
  
  public testCreatePagination(req: Request, totalItems: number, defaultLimit?: number) {
    return this.createPagination(req, totalItems, defaultLimit);
  }
  
  public testSendCreated<T>(res: Response, data: T) {
    this.sendCreated(res, data);
  }
  
  public testSendNoContent(res: Response) {
    this.sendNoContent(res);
  }
  
  public testSendBadRequest(res: Response, message?: string, details?: any) {
    this.sendBadRequest(res, message, details);
  }
  
  public testSendUnauthorized(res: Response, message?: string) {
    this.sendUnauthorized(res, message);
  }
  
  public testSendForbidden(res: Response, message?: string) {
    this.sendForbidden(res, message);
  }
  
  public testSendNotFound(res: Response, message?: string) {
    this.sendNotFound(res, message);
  }
  
  public testSendConflict(res: Response, message?: string, details?: any) {
    this.sendConflict(res, message, details);
  }
  
  public testSendServerError(res: Response, error?: Error | string) {
    this.sendServerError(res, error);
  }
}

describe('BaseController', () => {
  // Create controller instance
  const controller = new TestController();
  
  // Mock response object
  let res: Partial<Response>;
  
  beforeEach(() => {
    // Reset mocks before each test
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      end: jest.fn()
    };
  });

  describe('sendSuccess', () => {
    it('should send a success response with data', () => {
      const data = { id: '1', name: 'Test' };
      controller.testSendSuccess(res as Response, data);
      
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data,
        error: null
      });
    });

    it('should send a success response with custom status code', () => {
      const data = { id: '1', name: 'Test' };
      controller.testSendSuccess(res as Response, data, HttpStatus.CREATED);
      
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data,
        error: null
      });
    });

    it('should send a success response with pagination metadata', () => {
      const data = [{ id: '1', name: 'Test' }];
      const pagination = {
        currentPage: 1,
        pageSize: 10,
        totalItems: 100,
        totalPages: 10,
        hasNextPage: true,
        hasPrevPage: false
      };
      
      controller.testSendSuccess(res as Response, data, HttpStatus.OK, { pagination });
      
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data,
        error: null,
        meta: { pagination }
      });
    });
  });

  describe('sendError', () => {
    it('should send an error response with message', () => {
      controller.testSendError(res as Response, HttpStatus.BAD_REQUEST, 'Invalid input');
      
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        data: null,
        error: {
          code: HttpStatus.BAD_REQUEST,
          message: 'Invalid input'
        }
      });
    });

    it('should send an error response with details', () => {
      const details = {
        email: 'Email is required',
        password: 'Password must be at least 8 characters'
      };
      
      controller.testSendError(res as Response, HttpStatus.UNPROCESSABLE_ENTITY, 'Validation failed', details);
      
      expect(res.status).toHaveBeenCalledWith(HttpStatus.UNPROCESSABLE_ENTITY);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        data: null,
        error: {
          code: HttpStatus.UNPROCESSABLE_ENTITY,
          message: 'Validation failed',
          details
        }
      });
    });
  });

  describe('createPagination', () => {
    it('should create pagination metadata from request query parameters', () => {
      const req = { query: { page: '2', limit: '15' } } as unknown as Request;
      const totalItems = 100;
      
      const result = controller.testCreatePagination(req, totalItems);
      
      expect(result).toEqual({
        currentPage: 2,
        pageSize: 15,
        totalItems: 100,
        totalPages: 7,
        hasNextPage: true,
        hasPrevPage: true
      });
    });

    it('should use default values when query parameters are missing', () => {
      const req = { query: {} } as unknown as Request;
      const totalItems = 30;
      
      const result = controller.testCreatePagination(req, totalItems);
      
      expect(result).toEqual({
        currentPage: 1,
        pageSize: 10,
        totalItems: 30,
        totalPages: 3,
        hasNextPage: true,
        hasPrevPage: false
      });
    });

    it('should use custom default limit', () => {
      const req = { query: {} } as unknown as Request;
      const totalItems = 100;
      const defaultLimit = 20;
      
      const result = controller.testCreatePagination(req, totalItems, defaultLimit);
      
      expect(result).toEqual({
        currentPage: 1,
        pageSize: 20,
        totalItems: 100,
        totalPages: 5,
        hasNextPage: true,
        hasPrevPage: false
      });
    });
  });

  // Additional tests for helper methods
  describe('helper methods', () => {
    it('should send created response', () => {
      const data = { id: '1', name: 'Test' };
      controller.testSendCreated(res as Response, data);
      
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data,
        error: null
      });
    });

    it('should send no content response', () => {
      controller.testSendNoContent(res as Response);
      
      expect(res.status).toHaveBeenCalledWith(HttpStatus.NO_CONTENT);
      expect(res.end).toHaveBeenCalled();
    });

    it('should send bad request response', () => {
      controller.testSendBadRequest(res as Response, 'Invalid parameters');
      
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        data: null,
        error: {
          code: HttpStatus.BAD_REQUEST,
          message: 'Invalid parameters'
        }
      });
    });

    it('should send unauthorized response', () => {
      controller.testSendUnauthorized(res as Response);
      
      expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        data: null,
        error: {
          code: HttpStatus.UNAUTHORIZED,
          message: 'Authentication required'
        }
      });
    });

    it('should send not found response', () => {
      controller.testSendNotFound(res as Response, 'Book not found');
      
      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        data: null,
        error: {
          code: HttpStatus.NOT_FOUND,
          message: 'Book not found'
        }
      });
    });

    it('should send server error response', () => {
      // Mock console.error to prevent test output pollution
      console.error = jest.fn();
      
      const error = new Error('Database connection failed');
      controller.testSendServerError(res as Response, error);
      
      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        data: null,
        error: {
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Database connection failed'
        }
      });
      expect(console.error).toHaveBeenCalledWith(error);
    });
  });
});
