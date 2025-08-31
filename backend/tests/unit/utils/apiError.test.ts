// tests/unit/utils/apiError.test.ts
import { ApiError } from '../../../src/utils/apiError';

describe('ApiError', () => {
  describe('constructor', () => {
    it('should create an ApiError with default code 500', () => {
      const error = new ApiError('Test error');
      expect(error).toBeInstanceOf(ApiError);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe(500);
      expect(error.data).toBeUndefined();
    });

    it('should create an ApiError with specified code', () => {
      const error = new ApiError('Not found', 404);
      expect(error.message).toBe('Not found');
      expect(error.code).toBe(404);
    });

    it('should create an ApiError with additional data', () => {
      const data = { field: 'username', issue: 'already taken' };
      const error = new ApiError('Conflict', 409, data);
      expect(error.message).toBe('Conflict');
      expect(error.code).toBe(409);
      expect(error.data).toEqual(data);
    });
  });

  describe('toJSON', () => {
    it('should convert error to JSON without data', () => {
      const error = new ApiError('Test error', 500);
      const json = error.toJSON();
      expect(json).toEqual({
        code: 500,
        message: 'Test error',
      });
    });

    it('should convert error to JSON with data', () => {
      const data = { field: 'email', issue: 'invalid format' };
      const error = new ApiError('Bad request', 400, data);
      const json = error.toJSON();
      expect(json).toEqual({
        code: 400,
        message: 'Bad request',
        details: data,
      });
    });
  });

  describe('factory methods', () => {
    it('should create a BadRequest error', () => {
      const error = ApiError.badRequest('Invalid input');
      expect(error.message).toBe('Invalid input');
      expect(error.code).toBe(400);
    });

    it('should create an Unauthorized error', () => {
      const error = ApiError.unauthorized('Invalid credentials');
      expect(error.message).toBe('Invalid credentials');
      expect(error.code).toBe(401);
    });

    it('should create a Forbidden error', () => {
      const error = ApiError.forbidden('Not allowed');
      expect(error.message).toBe('Not allowed');
      expect(error.code).toBe(403);
    });

    it('should create a NotFound error', () => {
      const error = ApiError.notFound('Book not found');
      expect(error.message).toBe('Book not found');
      expect(error.code).toBe(404);
    });

    it('should create a Conflict error', () => {
      const error = ApiError.conflict('Username already exists');
      expect(error.message).toBe('Username already exists');
      expect(error.code).toBe(409);
    });

    it('should create an Internal error', () => {
      const error = ApiError.internal('Database error');
      expect(error.message).toBe('Database error');
      expect(error.code).toBe(500);
    });

    it('should create a Validation error with errors array', () => {
      const validationErrors = [
        { param: 'email', message: 'Invalid email' },
        { param: 'password', message: 'Too short' },
      ];
      const error = ApiError.validation(validationErrors);
      expect(error.message).toBe('Validation failed');
      expect(error.code).toBe(400);
      expect(error.data).toEqual({ errors: validationErrors });
    });

    it('should use default messages when not provided', () => {
      expect(ApiError.badRequest().message).toBe('Bad request');
      expect(ApiError.unauthorized().message).toBe('Unauthorized');
      expect(ApiError.forbidden().message).toBe('Forbidden');
      expect(ApiError.notFound().message).toBe('Resource not found');
      expect(ApiError.conflict().message).toBe('Resource conflict');
      expect(ApiError.internal().message).toBe('Internal server error');
    });
  });
});
