// tests/unit/controllers/base.controller.test.ts
import { Response } from 'express';
import { BaseController } from '../../../src/controllers/base.controller';
import { ApiError } from '../../../src/utils/apiError';
import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';

describe('BaseController', () => {
  let mockResponse: Partial<Response>;
  let jsonSpy: jest.SpyInstance;
  let statusSpy: jest.SpyInstance;

  beforeEach(() => {
    jsonSpy = jest.fn().mockReturnThis();
    statusSpy = jest.fn().mockReturnValue({ json: jsonSpy });
    mockResponse = {
      status: statusSpy,
      json: jsonSpy
    };
  });

  describe('sendResponse', () => {
    it('should send a response with correct status code and data', () => {
      const data = { id: '123', name: 'Test' };
      BaseController.sendResponse(mockResponse as Response, 200, data);
      
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith({
        status: 'success',
        data,
        error: null
      });
    });
  });

  describe('sendSuccess', () => {
    it('should send a success response with 200 status code', () => {
      const data = { id: '123', name: 'Test' };
      BaseController.sendSuccess(mockResponse as Response, data);
      
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith({
        status: 'success',
        data,
        error: null
      });
    });

    it('should send a success response with metadata', () => {
      const data = { items: [{ id: '123', name: 'Test' }] };
      const meta = { pagination: { currentPage: 1, totalPages: 5 } };
      
      BaseController.sendSuccess(mockResponse as Response, data, meta);
      
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith({
        status: 'success',
        data,
        error: null,
        meta
      });
    });
  });

  describe('sendCreated', () => {
    it('should send a created response with 201 status code', () => {
      const data = { id: '123', name: 'Test' };
      BaseController.sendCreated(mockResponse as Response, data);
      
      expect(statusSpy).toHaveBeenCalledWith(201);
      expect(jsonSpy).toHaveBeenCalledWith({
        status: 'success',
        data,
        error: null
      });
    });
  });

  describe('sendNoContent', () => {
    it('should send a no content response with 204 status code', () => {
      const endSpy = jest.fn();
      mockResponse.status = statusSpy.mockReturnValue({ end: endSpy });
      
      BaseController.sendNoContent(mockResponse as Response);
      
      expect(statusSpy).toHaveBeenCalledWith(204);
      expect(endSpy).toHaveBeenCalled();
    });
  });

  describe('sendError', () => {
    it('should send an error response with ApiError', () => {
      const error = new ApiError('Not found', 404);
      BaseController.sendError(mockResponse as Response, error);
      
      expect(statusSpy).toHaveBeenCalledWith(404);
      expect(jsonSpy).toHaveBeenCalledWith({
        status: 'error',
        data: null,
        error: {
          code: 404,
          message: 'Not found'
        }
      });
    });

    it('should send an error response with message and code', () => {
      BaseController.sendError(mockResponse as Response, 'Bad request', 400);
      
      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        status: 'error',
        data: null,
        error: {
          code: 400,
          message: 'Bad request'
        }
      });
    });

    it('should send an error response with validation errors', () => {
      const validationErrors = [
        { param: 'email', message: 'Invalid email' },
        { param: 'password', message: 'Password too short' }
      ];
      
      BaseController.sendError(
        mockResponse as Response,
        'Validation failed',
        400,
        validationErrors
      );
      
      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        status: 'error',
        data: null,
        error: {
          code: 400,
          message: 'Validation failed',
          errors: validationErrors
        }
      });
    });
  });

  describe('HTTP status methods', () => {
    it('should send a bad request response', () => {
      BaseController.sendBadRequest(mockResponse as Response, 'Invalid input');
      
      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        status: 'error',
        data: null,
        error: {
          code: 400,
          message: 'Invalid input'
        }
      });
    });

    it('should send an unauthorized response', () => {
      BaseController.sendUnauthorized(mockResponse as Response, 'Not authenticated');
      
      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        status: 'error',
        data: null,
        error: {
          code: 401,
          message: 'Not authenticated'
        }
      });
    });

    it('should send a forbidden response', () => {
      BaseController.sendForbidden(mockResponse as Response, 'Not allowed');
      
      expect(statusSpy).toHaveBeenCalledWith(403);
      expect(jsonSpy).toHaveBeenCalledWith({
        status: 'error',
        data: null,
        error: {
          code: 403,
          message: 'Not allowed'
        }
      });
    });

    it('should send a not found response', () => {
      BaseController.sendNotFound(mockResponse as Response, 'Resource not found');
      
      expect(statusSpy).toHaveBeenCalledWith(404);
      expect(jsonSpy).toHaveBeenCalledWith({
        status: 'error',
        data: null,
        error: {
          code: 404,
          message: 'Resource not found'
        }
      });
    });

    it('should send a conflict response', () => {
      BaseController.sendConflict(mockResponse as Response, 'Resource already exists');
      
      expect(statusSpy).toHaveBeenCalledWith(409);
      expect(jsonSpy).toHaveBeenCalledWith({
        status: 'error',
        data: null,
        error: {
          code: 409,
          message: 'Resource already exists'
        }
      });
    });

    it('should send an internal error response', () => {
      BaseController.sendInternalError(mockResponse as Response, 'Server error');
      
      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        status: 'error',
        data: null,
        error: {
          code: 500,
          message: 'Server error'
        }
      });
    });
  });
});
