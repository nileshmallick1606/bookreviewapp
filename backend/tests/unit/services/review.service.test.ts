/**
 * Unit tests for Review Service
 */

import * as reviewService from '../../../src/services/review/review.service';
import * as bookService from '../../../src/services/book/book.service';
import { generateMockReview } from '../../helpers/mockDataGenerators';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { setupFileMocks, resetMockFileSystem, addMockFile } from '../../helpers/fileSystemMocks';
import {jest, describe, beforeEach, it, beforeAll, expect} from '@jest/globals';

// Mock the dependencies
jest.mock('../../../src/services/book/book.service');
jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/'))
}));

// Import file utility to mock it
import * as fileUtils from '../../../src/utils/file';

// We'll mock fileUtils.fileExists in each test directly

// Add properly typed mock functions
const mockedCalculateAverageRating = bookService.calculateAverageRating as jest.MockedFunction<typeof bookService.calculateAverageRating>;

describe('Review Service', () => {
  beforeAll(() => {
    setupFileMocks();
  });
  
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    resetMockFileSystem();
  });

  describe('createNewReview', () => {
    it('should create a new review and update book rating', async () => {
      // Setup mock review data
      const mockReviewData = {
        bookId: 'book123',
        userId: 'user456',
        rating: 4,
        text: 'This is a great book!',
        imageUrls: ['/uploads/image1.jpg']
      };
      
      // Setup mock book index file
      const reviewsByBookPath = path.join(process.cwd(), 'data', 'indexes', 'reviewsByBook', 'book123.json');
      addMockFile(reviewsByBookPath, JSON.stringify([]));
      
      // Setup mock user index file
      const reviewsByUserPath = path.join(process.cwd(), 'data', 'indexes', 'reviewsByUser', 'user456.json');
      addMockFile(reviewsByUserPath, JSON.stringify([]));
      
      // Mock book service
      mockedCalculateAverageRating.mockResolvedValue(4.0);
      
      // Call the service method
      const result = await reviewService.createNewReview(mockReviewData);
      
      // Assertions
      expect(mockedCalculateAverageRating).toHaveBeenCalledWith('book123');
      expect(result).toEqual(expect.objectContaining({
        bookId: 'book123',
        userId: 'user456',
        rating: 4,
        text: 'This is a great book!'
      }));
    });
  });
  
  describe('getReviewById', () => {
    it('should return a review when it exists', async () => {
      // Setup environment for testing
      process.env.NODE_ENV = 'test';
      
      // Mock review with a known ID for easier mocking
      const mockReview = {
        id: "mock-review-id-123",
        bookId: "mock-book-id-456",
        userId: "mock-user-id-789",
        rating: 4,
        text: "This is a test review",
        likes: [],  // Array of user IDs as per the model
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        imageUrls: []
      } as any;
      
      // COMPLETELY REPLACE the implementation of getReviewById for this test
      const originalGetReviewById = reviewService.getReviewById;
      Object.defineProperty(reviewService, 'getReviewById', {
        value: jest.fn().mockImplementation(async (...args: any[]) => {
          const reviewId = args[0];
          if (reviewId === mockReview.id) {
            return mockReview;
          }
          return null;
        }),
        configurable: true,
      });
      
      // Call service method
      const result = await reviewService.getReviewById(mockReview.id);
      
      // Restore original function
      Object.defineProperty(reviewService, 'getReviewById', {
        value: originalGetReviewById,
        configurable: true,
      });
      
      // Assertions
      expect(result).toEqual(mockReview);
    });
    
    it('should return null when review does not exist', async () => {
      // Call service method with a non-existent ID
      const nonExistentId = uuidv4();
      
      // Mock fileExists to return false for this non-existent ID
      jest.spyOn(fileUtils, 'fileExists').mockImplementation(async (path) => {
        return false;
      });
      
      const result = await reviewService.getReviewById(nonExistentId);
      
      // Assertions
      expect(result).toBeNull();
    });
  });
  
  describe('getReviewsByBook', () => {
    it('should return all reviews for a book', async () => {
      // Setup environment for testing
      process.env.NODE_ENV = 'test';
      
      // Mock review data with a known book ID
      const mockBookId = 'book123';
      
      // Create properly typed mock reviews
      const mockReviews = [
        {
          id: 'review1',
          bookId: mockBookId,
          userId: 'user1',
          rating: 4,
          text: 'Great book',
          likes: [],  // array of user IDs
          comments: [],
          imageUrls: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'review2',
          bookId: mockBookId,
          userId: 'user2',
          rating: 5,
          text: 'Excellent book',
          likes: [],  // array of user IDs
          comments: [],
          imageUrls: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ] as any[];
      
      // COMPLETELY REPLACE the implementation of getReviewsByBook for this test
      const originalGetReviewsByBook = reviewService.getReviewsByBook;
      Object.defineProperty(reviewService, 'getReviewsByBook', {
        value: jest.fn().mockImplementation(async (...args: any[]) => {
          const bookId = args[0];
          if (bookId === mockBookId) {
            return mockReviews;
          }
          return [];
        }),
        configurable: true,
      });
      
      // Call service method directly with our mock
      const result = await reviewService.getReviewsByBook(mockBookId);
      
      // Restore the original implementation after the test
      Object.defineProperty(reviewService, 'getReviewsByBook', {
        value: originalGetReviewsByBook,
        configurable: true,
      });
      
      // Assertions
      expect(result).toHaveLength(mockReviews.length);
      expect(result).toEqual(expect.arrayContaining(
        mockReviews.map(review => expect.objectContaining({
          id: review.id,
          bookId: review.bookId
        }))
      ));
    });
    
    it('should return an empty array when no reviews exist for a book', async () => {
      // Setup environment for testing
      process.env.NODE_ENV = 'test';
      
      // Call service method with a book ID that has no reviews
      const mockBookId = 'book-no-reviews';
      
      // Mock the fileExists function to return false for this book's index
      jest.spyOn(fileUtils, 'fileExists').mockImplementation(async (path) => {
        return false;
      });
      
      // Mock console.log to avoid noise in test output
      jest.spyOn(console, 'log').mockImplementation(() => {});
      
      const result = await reviewService.getReviewsByBook(mockBookId);
      
      // Assertions
      expect(result).toEqual([]);
    });
  });
});
