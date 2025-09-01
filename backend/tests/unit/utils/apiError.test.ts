/**
 * Tests for API Error utility
 */

import { jest, describe, it, expect } from '@jest/globals';
import { ApiError } from '../../../src/utils/apiError';

describe('ApiError', () => {
  describe('Basic functionality', () => {
    it('should create an error with default code', () => {
      const error = new ApiError('Test error');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe(500);
      expect(error.data).toBeUndefined();
    });
    
    it('should create an error with specified code', () => {
      const error = new ApiError('Not found', 404);
      
      expect(error.message).toBe('Not found');
      expect(error.code).toBe(404);
    });
    
    it('should include optional data', () => {
      const errorData = { field: 'email', reason: 'already exists' };
      const error = new ApiError('Validation error', 400, errorData);
      
      expect(error.message).toBe('Validation error');
      expect(error.code).toBe(400);
      expect(error.data).toEqual(errorData);
    });
  });
  
  it('should convert to JSON correctly', () => {
    const error = new ApiError('Bad request', 400, { detail: 'Invalid input' });
    const json = error.toJSON();
    
    expect(json).toHaveProperty('message');
    expect(json).toHaveProperty('code');
    expect(json).toHaveProperty('details');
    expect(json.message).toBe('Bad request');
    expect(json.code).toBe(400);
    expect(json.details).toEqual({ detail: 'Invalid input' });
  });
  
  it('should create errors using factory methods', () => {
    const badRequestError = ApiError.badRequest('Invalid input');
    expect(badRequestError.code).toBe(400);
    expect(badRequestError.message).toBe('Invalid input');
    
    const unauthorizedError = ApiError.unauthorized();
    expect(unauthorizedError.code).toBe(401);
    expect(unauthorizedError.message).toBe('Unauthorized');
    
    // Test with default message
    const defaultBadRequest = ApiError.badRequest();
    expect(defaultBadRequest.code).toBe(400);
    expect(defaultBadRequest.message).toBe('Bad request');
  });
});
