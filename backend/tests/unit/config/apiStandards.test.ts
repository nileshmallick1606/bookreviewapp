/**
 * Unit tests for API Standards Configuration
 */

import { jest, describe, it, expect } from '@jest/globals';
import * as apiStandards from '../../../src/config/apiStandards';

describe('API Standards', () => {
  describe('ApiResponse Interface', () => {
    it('should correctly format success responses', () => {
      // Create a success response using the ApiResponse interface
      const successResponse: apiStandards.ApiResponse<string> = {
        status: 'success',
        data: 'Test data',
        error: null
      };
      
      // Verify the response format
      expect(successResponse.status).toBe('success');
      expect(successResponse.data).toBe('Test data');
      expect(successResponse.error).toBeNull();
    });
    
    it('should correctly format error responses', () => {
      // Create an error response using the ApiResponse interface
      const errorResponse: apiStandards.ApiResponse<null> = {
        status: 'error',
        data: null,
        error: {
          code: 400,
          message: 'Bad request',
          details: { field: 'email', issue: 'Invalid format' }
        }
      };
      
      // Verify the response format
      expect(errorResponse.status).toBe('error');
      expect(errorResponse.data).toBeNull();
      expect(errorResponse.error).not.toBeNull();
      expect(errorResponse.error?.code).toBe(400);
      expect(errorResponse.error?.message).toBe('Bad request');
      expect(errorResponse.error?.details).toBeDefined();
    });
    
    it('should support pagination metadata', () => {
      // Create a response with pagination metadata
      const paginatedResponse: apiStandards.ApiResponse<string[]> = {
        status: 'success',
        data: ['item1', 'item2'],
        error: null,
        meta: {
          pagination: {
            currentPage: 1,
            pageSize: 10,
            totalItems: 100,
            totalPages: 10,
            hasNextPage: true,
            hasPrevPage: false
          }
        }
      };
      
      // Verify pagination metadata
      expect(paginatedResponse.meta).toBeDefined();
      expect(paginatedResponse.meta?.pagination).toBeDefined();
      expect(paginatedResponse.meta?.pagination?.totalItems).toBe(100);
      expect(paginatedResponse.meta?.pagination?.currentPage).toBe(1);
      expect(paginatedResponse.meta?.pagination?.hasNextPage).toBe(true);
    });
  });
  
  describe('API Error Interface', () => {
    it('should support required error properties', () => {
      const error: apiStandards.ApiError = {
        code: 404,
        message: 'Resource not found'
      };
      
      expect(error.code).toBe(404);
      expect(error.message).toBe('Resource not found');
      expect(error.details).toBeUndefined();
    });
    
    it('should support optional error details', () => {
      const errorWithDetails: apiStandards.ApiError = {
        code: 422,
        message: 'Validation error',
        details: {
          fields: ['email', 'password'],
          issues: ['Invalid email format', 'Password too short']
        }
      };
      
      expect(errorWithDetails.details).toBeDefined();
      expect(errorWithDetails.details?.fields).toBeInstanceOf(Array);
      expect(errorWithDetails.details?.issues).toBeInstanceOf(Array);
    });
  });
});
