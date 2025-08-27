// @ts-nocheck - Temporarily disable TypeScript checks for tests
import { Request, Response } from 'express';
import * as ratingController from '../../../src/controllers/rating.controller';
import { fileExists } from '../../../src/utils/file';

// Explicitly import Jest types
import { jest, describe, beforeEach, it, expect } from '@jest/globals';

// Mock dependencies
jest.mock('../../../src/utils/file');

// Mock the readFile function directly in the controller module
const mockReadFile = jest.fn();
ratingController.readFile = mockReadFile;

jest.mock('path', () => ({
  join: jest.fn().mockImplementation((...paths) => paths.join('/'))
}));

// Get the mocked functions
const mockFileExists = fileExists as jest.MockedFunction<typeof fileExists>;
const mockReadFile = jest.fn().mockResolvedValue(Buffer.from('[]'));
const fs = require('fs');
fs.promises.readFile = mockReadFile;

describe('Rating Controller', () => {
  // Mock Request and Response objects
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  
  beforeEach(() => {
    jest.resetAllMocks();
    
    // Setup mock request and response
    mockRequest = {
      query: {}
    };
    
    mockResponse = {
      status: jest.fn(() => mockResponse),
      json: jest.fn(() => mockResponse)
    } as Partial<Response>;
    
    mockFileExists.mockImplementation((path) => {
      console.log('fileExists called with path:', path);
      return Promise.resolve(true);
    });
  });

  describe('getTopRatedBooks', () => {
    it('should return top-rated books with default limit', async () => {
      // Mock data
      const mockTopRatedBooks = [
        { id: 'book-1', title: 'Book 1', averageRating: 5.0 },
        { id: 'book-2', title: 'Book 2', averageRating: 4.5 },
        { id: 'book-3', title: 'Book 3', averageRating: 4.0 },
        { id: 'book-4', title: 'Book 4', averageRating: 3.5 },
        { id: 'book-5', title: 'Book 5', averageRating: 3.0 },
        { id: 'book-6', title: 'Book 6', averageRating: 2.5 },
        { id: 'book-7', title: 'Book 7', averageRating: 2.0 },
        { id: 'book-8', title: 'Book 8', averageRating: 1.5 },
        { id: 'book-9', title: 'Book 9', averageRating: 1.0 },
        { id: 'book-10', title: 'Book 10', averageRating: 0.5 },
        { id: 'book-11', title: 'Book 11', averageRating: 0.0 }
      ];

      // Setup mocks
      mockReadFile.mockImplementation((path, encoding) => {
        console.log('mockReadFile called with encoding:', encoding);
        if (encoding === 'utf-8') {
          console.log('Returning string data');
          return Promise.resolve(JSON.stringify(mockTopRatedBooks));
        }
        console.log('Returning buffer data');
        return Promise.resolve(Buffer.from(JSON.stringify(mockTopRatedBooks)));
      });

      // Execute function
      await getTopRatedBooks(mockRequest as Request, mockResponse as Response);

      // Verify response
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          books: mockTopRatedBooks.slice(0, 10) // Default limit is 10
        }
      });
    });

    it('should respect the limit parameter', async () => {
      // Mock data
      const mockTopRatedBooks = [
        { id: 'book-1', title: 'Book 1', averageRating: 5.0 },
        { id: 'book-2', title: 'Book 2', averageRating: 4.5 },
        { id: 'book-3', title: 'Book 3', averageRating: 4.0 },
        { id: 'book-4', title: 'Book 4', averageRating: 3.5 },
        { id: 'book-5', title: 'Book 5', averageRating: 3.0 }
      ];

      // Setup mocks
      mockReadFile.mockImplementation((path, encoding) => {
        if (encoding === 'utf-8') {
          return Promise.resolve(JSON.stringify(mockTopRatedBooks));
        }
        return Promise.resolve(Buffer.from(JSON.stringify(mockTopRatedBooks)));
      });
      mockRequest.query = { limit: '3' };

      // Execute function
      await getTopRatedBooks(mockRequest as Request, mockResponse as Response);

      // Verify response has only 3 books
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          books: mockTopRatedBooks.slice(0, 3)
        }
      });
    });

    it('should return empty array when index file does not exist', async () => {
      // Mock file not existing
      mockFileExists.mockResolvedValue(false);

      // Execute function
      await getTopRatedBooks(mockRequest as Request, mockResponse as Response);

      // Verify response
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          books: []
        }
      });

      // Verify readFile was not called
      expect(mockReadFile).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      // Force an error
      mockFileExists.mockRejectedValue(new Error('Test error'));

      // Execute function
      await getTopRatedBooks(mockRequest as Request, mockResponse as Response);

      // Verify error response
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        error: {
          code: 500,
          message: 'Failed to fetch top-rated books'
        }
      });
    });
  });
});
