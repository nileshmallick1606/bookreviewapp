import { describe, it, expect } from '@jest/globals';
import { 
  successResponse, 
  errorResponse, 
  createPaginationMeta,
  HttpStatus,
  ApiResponse,
  PaginationMeta
} from '../../src/config/apiStandards';

describe('API Standards', () => {
  describe('successResponse', () => {
    it('should create a proper success response without meta', () => {
      const data = { id: '1', name: 'Test' };
      const response = successResponse(data);
      
      expect(response).toEqual({
        status: 'success',
        data,
        error: null
      });
    });

    it('should create a success response with pagination meta', () => {
      const data = [{ id: '1', name: 'Test' }];
      const pagination: PaginationMeta = {
        currentPage: 1,
        pageSize: 10,
        totalItems: 100,
        totalPages: 10,
        hasNextPage: true,
        hasPrevPage: false
      };
      
      const response = successResponse(data, { pagination });
      
      expect(response).toEqual({
        status: 'success',
        data,
        error: null,
        meta: { pagination }
      });
    });
  });

  describe('errorResponse', () => {
    it('should create a proper error response without details', () => {
      const code = HttpStatus.BAD_REQUEST;
      const message = 'Invalid input';
      const response = errorResponse(code, message);
      
      expect(response).toEqual({
        status: 'error',
        data: null,
        error: {
          code,
          message
        }
      });
    });

    it('should create an error response with details', () => {
      const code = HttpStatus.UNPROCESSABLE_ENTITY;
      const message = 'Validation failed';
      const details = {
        email: 'Email is invalid',
        password: 'Password is too short'
      };
      
      const response = errorResponse(code, message, details);
      
      expect(response).toEqual({
        status: 'error',
        data: null,
        error: {
          code,
          message,
          details
        }
      });
    });
  });

  describe('createPaginationMeta', () => {
    it('should create correct pagination metadata for first page', () => {
      const meta = createPaginationMeta(1, 10, 100);
      
      expect(meta).toEqual({
        currentPage: 1,
        pageSize: 10,
        totalItems: 100,
        totalPages: 10,
        hasNextPage: true,
        hasPrevPage: false
      });
    });

    it('should create correct pagination metadata for middle page', () => {
      const meta = createPaginationMeta(5, 10, 100);
      
      expect(meta).toEqual({
        currentPage: 5,
        pageSize: 10,
        totalItems: 100,
        totalPages: 10,
        hasNextPage: true,
        hasPrevPage: true
      });
    });

    it('should create correct pagination metadata for last page', () => {
      const meta = createPaginationMeta(10, 10, 100);
      
      expect(meta).toEqual({
        currentPage: 10,
        pageSize: 10,
        totalItems: 100,
        totalPages: 10,
        hasNextPage: false,
        hasPrevPage: true
      });
    });

    it('should handle non-even division of items', () => {
      const meta = createPaginationMeta(1, 10, 5);
      
      expect(meta).toEqual({
        currentPage: 1,
        pageSize: 10,
        totalItems: 5,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false
      });
    });
  });
});
