// @ts-nocheck - Temporarily disable TypeScript checks for tests
import fs from 'fs';
import path from 'path';
import { calculateAverageRating, updateTopRatedBooksIndex } from '../../../../src/services/book/book.service';
import { getReviewsByBook } from '../../../../src/services/review/review.service';
import { jest, describe, beforeEach, it, expect } from '@jest/globals';

// Mock dependencies
jest.mock('fs');
jest.mock('path');
jest.mock('../../../../src/services/review/review.service');

// Mock file system functions
const mockFs = fs as jest.Mocked<typeof fs>;
const mockPath = path as jest.Mocked<typeof path>;
const mockGetReviewsByBook = getReviewsByBook as jest.MockedFunction<typeof getReviewsByBook>;

describe('Book Rating Service', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
    mockPath.join.mockImplementation((...paths) => paths.join('/'));
  });

  describe('calculateAverageRating', () => {
    it('should calculate average rating correctly', async () => {
      // Mock book data
      const mockBookData = JSON.stringify({
        id: 'book-123',
        title: 'Test Book',
        author: 'Test Author'
      });

      // Mock reviews with ratings
      const mockReviews = [
        { 
          id: 'review-1', 
          userId: 'user-1',
          bookId: 'book-123',
          rating: 5,
          text: 'Great book',
          likes: [],
          comments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        { 
          id: 'review-2', 
          userId: 'user-2',
          bookId: 'book-123',
          rating: 3,
          text: 'Average book',
          likes: [],
          comments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        { 
          id: 'review-3', 
          userId: 'user-3',
          bookId: 'book-123',
          rating: 4,
          text: 'Good book',
          likes: [],
          comments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      // Setup mocks
      mockFs.promises.readFile = jest.fn().mockResolvedValue(mockBookData);
      mockFs.promises.writeFile = jest.fn().mockResolvedValue(undefined);
      mockGetReviewsByBook.mockResolvedValue(mockReviews);

      // Mock existsSync to return true
      const mockExistsSync = jest.fn().mockReturnValue(true);
      mockFs.existsSync = mockExistsSync;

      // Execute function
      const result = await calculateAverageRating('book-123');

      // Assertions
      expect(result).toBe(4.0); // Average of 5, 3, and 4
      expect(mockFs.promises.writeFile).toHaveBeenCalled();

      // Verify that the book data was updated correctly
      const writtenData = JSON.parse(mockFs.promises.writeFile.mock.calls[0][1]);
      expect(writtenData.averageRating).toBe(4.0);
      expect(writtenData.totalReviews).toBe(3);
      expect(writtenData.ratingDistribution).toEqual({
        1: 0,
        2: 0,
        3: 1,
        4: 1,
        5: 1
      });
    });

    it('should handle case with no reviews', async () => {
      // Mock book data
      const mockBookData = JSON.stringify({
        id: 'book-123',
        title: 'Test Book',
        author: 'Test Author'
      });

      // Mock empty reviews array
      const mockReviews: any[] = [];

      // Setup mocks
      mockFs.promises.readFile = jest.fn().mockResolvedValue(mockBookData);
      mockFs.promises.writeFile = jest.fn().mockResolvedValue(undefined);
      mockGetReviewsByBook.mockResolvedValue(mockReviews);

      // Mock existsSync to return true
      const mockExistsSync = jest.fn().mockReturnValue(true);
      mockFs.existsSync = mockExistsSync;

      // Execute function
      const result = await calculateAverageRating('book-123');

      // Assertions
      expect(result).toBeNull();
      expect(mockFs.promises.writeFile).toHaveBeenCalled();

      // Verify that the book data was updated correctly
      const writtenData = JSON.parse(mockFs.promises.writeFile.mock.calls[0][1]);
      expect(writtenData.averageRating).toBeNull();
      expect(writtenData.totalReviews).toBe(0);
      expect(writtenData.ratingDistribution).toEqual({
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0
      });
    });

    it('should round ratings to one decimal place', async () => {
      // Mock book data
      const mockBookData = JSON.stringify({
        id: 'book-123',
        title: 'Test Book',
        author: 'Test Author'
      });

      // Mock reviews with ratings
      const mockReviews = [
        { 
          id: 'review-1', 
          userId: 'user-1',
          bookId: 'book-123',
          rating: 5,
          text: 'Great book',
          likes: [],
          comments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        { 
          id: 'review-2', 
          userId: 'user-2',
          bookId: 'book-123',
          rating: 3,
          text: 'Average book',
          likes: [],
          comments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        { 
          id: 'review-3', 
          userId: 'user-3',
          bookId: 'book-123',
          rating: 2,
          text: 'Not great',
          likes: [],
          comments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        { 
          id: 'review-4', 
          userId: 'user-4',
          bookId: 'book-123',
          rating: 1,
          text: 'Bad book',
          likes: [],
          comments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        { 
          id: 'review-5', 
          userId: 'user-5',
          bookId: 'book-123',
          rating: 5,
          text: 'Excellent book',
          likes: [],
          comments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        { 
          id: 'review-6', 
          userId: 'user-6',
          bookId: 'book-123',
          rating: 4,
          text: 'Good book',
          likes: [],
          comments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      // Setup mocks
      mockFs.promises.readFile = jest.fn().mockResolvedValue(mockBookData);
      mockFs.promises.writeFile = jest.fn().mockResolvedValue(undefined);
      mockGetReviewsByBook.mockResolvedValue(mockReviews);

      // Mock existsSync to return true
      const mockExistsSync = jest.fn().mockReturnValue(true);
      mockFs.existsSync = mockExistsSync;

      // Execute function
      const result = await calculateAverageRating('book-123');

      // Average of 5, 3, 2, 1, 5, 4 = 20/6 = 3.3333...
      // Should be rounded to 3.3
      expect(result).toBe(3.3);
    });
  });

  describe('updateTopRatedBooksIndex', () => {
    it('should create top-rated books index correctly', async () => {
      // Mock book data
      const mockBooks = [
        { id: 'book-1', title: 'Book 1', averageRating: 4.5, totalReviews: 10 },
        { id: 'book-2', title: 'Book 2', averageRating: 3.2, totalReviews: 5 },
        { id: 'book-3', title: 'Book 3', averageRating: 5.0, totalReviews: 3 },
        { id: 'book-4', title: 'Book 4', averageRating: null, totalReviews: 0 }
      ];

      // Mock file system functions
      mockFs.readdir = jest.fn().mockImplementation((dir, callback) => {
        if (callback) callback(null, ['book-1.json', 'book-2.json', 'book-3.json', 'book-4.json']);
        return Promise.resolve(['book-1.json', 'book-2.json', 'book-3.json', 'book-4.json']);
      });

      mockFs.promises.readdir = jest.fn().mockResolvedValue(['book-1.json', 'book-2.json', 'book-3.json', 'book-4.json']);

      mockFs.promises.readFile = jest.fn().mockImplementation((path) => {
        if (path.includes('book-1')) return Promise.resolve(JSON.stringify(mockBooks[0]));
        if (path.includes('book-2')) return Promise.resolve(JSON.stringify(mockBooks[1]));
        if (path.includes('book-3')) return Promise.resolve(JSON.stringify(mockBooks[2]));
        if (path.includes('book-4')) return Promise.resolve(JSON.stringify(mockBooks[3]));
        return Promise.reject(new Error('File not found'));
      });

      mockFs.promises.mkdir = jest.fn().mockResolvedValue(undefined);
      mockFs.promises.writeFile = jest.fn().mockResolvedValue(undefined);

      // Execute function
      await updateTopRatedBooksIndex();

      // Verify the index was created correctly
      expect(mockFs.promises.writeFile).toHaveBeenCalled();
      const writtenData = JSON.parse(mockFs.promises.writeFile.mock.calls[0][1]);

      // Books should be sorted by rating in descending order
      // book-3 (5.0), book-1 (4.5), book-2 (3.2)
      // book-4 should be excluded because it has null rating
      expect(writtenData).toHaveLength(3);
      expect(writtenData[0].id).toBe('book-3');
      expect(writtenData[1].id).toBe('book-1');
      expect(writtenData[2].id).toBe('book-2');
    });
  });
});
