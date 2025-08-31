// tests/unit/config/apiStandards.test.ts
import {
  ApiResponse,
  successResponse,
  errorResponse,
  getPaginationLinks,
  getPagination,
} from '../../../src/config/apiStandards';

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

describe('API Standards', () => {
  describe('successResponse', () => {
    it('should create a success response with data', () => {
      const data = { user: { id: '123', name: 'Test User' } };
      const response = successResponse(data);
      
      expect(response).toEqual({
        status: 'success',
        data,
        error: null,
      });
    });

    it('should create a success response with data and meta', () => {
      const data = { books: [{ id: '123', title: 'Test Book' }] };
      const meta = { 
        pagination: { 
          currentPage: 1, 
          totalPages: 5 
        } 
      };
      const response = successResponse(data, meta);
      
      expect(response).toEqual({
        status: 'success',
        data,
        error: null,
        meta,
      });
    });
  });

  describe('errorResponse', () => {
    it('should create an error response with message and code', () => {
      const message = 'Resource not found';
      const code = 404;
      const response = errorResponse(message, code);
      
      expect(response).toEqual({
        status: 'error',
        data: null,
        error: {
          code,
          message,
        },
      });
    });

    it('should create an error response with errors array', () => {
      const message = 'Validation failed';
      const code = 400;
      const errors = [
        { param: 'email', message: 'Invalid email' },
        { param: 'password', message: 'Password too short' },
      ];
      const response = errorResponse(message, code, errors);
      
      expect(response).toEqual({
        status: 'error',
        data: null,
        error: {
          code,
          message,
          errors,
        },
      });
    });
  });

  describe('getPaginationLinks', () => {
    it('should generate pagination links for middle pages', () => {
      const page = 3;
      const limit = 10;
      const total = 50;
      const baseUrl = '/api/v1/books';
      
      const links = getPaginationLinks(page, limit, total, baseUrl);
      
      expect(links).toEqual({
        first: '/api/v1/books?page=1&limit=10',
        previous: '/api/v1/books?page=2&limit=10',
        next: '/api/v1/books?page=4&limit=10',
        last: '/api/v1/books?page=5&limit=10',
      });
    });

    it('should handle first page correctly', () => {
      const page = 1;
      const limit = 10;
      const total = 50;
      const baseUrl = '/api/v1/books';
      
      const links = getPaginationLinks(page, limit, total, baseUrl);
      
      expect(links).toEqual({
        first: '/api/v1/books?page=1&limit=10',
        previous: null,
        next: '/api/v1/books?page=2&limit=10',
        last: '/api/v1/books?page=5&limit=10',
      });
    });

    it('should handle last page correctly', () => {
      const page = 5;
      const limit = 10;
      const total = 50;
      const baseUrl = '/api/v1/books';
      
      const links = getPaginationLinks(page, limit, total, baseUrl);
      
      expect(links).toEqual({
        first: '/api/v1/books?page=1&limit=10',
        previous: '/api/v1/books?page=4&limit=10',
        next: null,
        last: '/api/v1/books?page=5&limit=10',
      });
    });

    it('should handle URLs with existing query parameters', () => {
      const page = 2;
      const limit = 10;
      const total = 30;
      const baseUrl = '/api/v1/books?genre=fiction&sortBy=title';
      
      const links = getPaginationLinks(page, limit, total, baseUrl);
      
      expect(links).toEqual({
        first: '/api/v1/books?genre=fiction&sortBy=title&page=1&limit=10',
        previous: '/api/v1/books?genre=fiction&sortBy=title&page=1&limit=10',
        next: '/api/v1/books?genre=fiction&sortBy=title&page=3&limit=10',
        last: '/api/v1/books?genre=fiction&sortBy=title&page=3&limit=10',
      });
    });

    it('should handle case with no results', () => {
      const page = 1;
      const limit = 10;
      const total = 0;
      const baseUrl = '/api/v1/books';
      
      const links = getPaginationLinks(page, limit, total, baseUrl);
      
      expect(links).toEqual({
        first: '/api/v1/books?page=1&limit=10',
        previous: null,
        next: null,
        last: '/api/v1/books?page=1&limit=10',
      });
    });
  });

  describe('getPagination', () => {
    it('should generate complete pagination metadata', () => {
      const page = 2;
      const limit = 10;
      const total = 25;
      const baseUrl = '/api/v1/books';
      
      const pagination = getPagination(page, limit, total, baseUrl);
      
      expect(pagination).toEqual({
        currentPage: 2,
        totalPages: 3,
        pageSize: 10,
        totalCount: 25,
        links: {
          first: '/api/v1/books?page=1&limit=10',
          previous: '/api/v1/books?page=1&limit=10',
          next: '/api/v1/books?page=3&limit=10',
          last: '/api/v1/books?page=3&limit=10',
        },
      });
    });
  });
});
