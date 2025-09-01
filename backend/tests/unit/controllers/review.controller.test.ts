
import * as reviewService from '../../../src/services/review/review.service';
import * as bookService from '../../../src/services/book/book.service';
import { createMockRequest, createMockResponse } from '../../helpers/expressTestUtils';
import { generateMockReview } from '../../helpers/mockDataGenerators';
import {jest, describe, beforeEach, it, expect} from '@jest/globals';
import { createReview, getBookReviews } from '../../../src/controllers/review.controller';
import { Review } from '../../../src/models/review/review.model';

// Mock the dependencies
jest.mock('../../../src/services/review/review.service');
jest.mock('../../../src/services/book/book.service');

// Add proper typing for mocked functions
const mockedCreateNewReview = reviewService.createNewReview as jest.MockedFunction<typeof reviewService.createNewReview>;
const mockedGetReviewsByBook = reviewService.getReviewsByBook as jest.MockedFunction<typeof reviewService.getReviewsByBook>;

describe('Review Controller', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createReview', () => {
    it('should create a new review when data is valid', async () => {
      // Mock review data
      const mockReview = generateMockReview({
        bookId: 'book123',
        userId: 'user456',
        rating: 4,
        text: 'Great book!',
        imageUrls: ['/uploads/image1.jpg']
      });
      
      // Mock service response
      mockedCreateNewReview.mockResolvedValue(mockReview as any);
      
      // Setup request
      const req = createMockRequest({
        params: { bookId: 'book123' },
        body: {
          text: 'Great book!',
          rating: '4'
        },
        user: { id: 'user456' },
        files: [{ filename: 'image1.jpg' }]
      });
      const res = createMockResponse();
      
      // Call the controller
      await createReview(req as any, res as any);
      
      // Assertions
      expect(mockedCreateNewReview).toHaveBeenCalledWith({
        bookId: 'book123',
        userId: 'user456',
        text: 'Great book!',
        rating: 4,
        imageUrls: ['/uploads/image1.jpg']
      });
      // The calculateAverageRating is called within the createNewReview service, not in the controller
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockReview,
        error: null
      });
    });
    
    it('should return 401 when user is not authenticated', async () => {
      // Setup request without user
      const req = createMockRequest({
        params: { bookId: 'book123' },
        body: {
          text: 'Great book!',
          rating: '4'
        },
        // No user property = unauthenticated
      });
      const res = createMockResponse();
      
      // Call the controller
      await createReview(req as any, res as any);
      
      // Assertions
      expect(mockedCreateNewReview).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        error: expect.objectContaining({
          code: 401,
          message: 'Authentication required'
        }),
        data: null
      });
    });
    
    it('should return 400 when rating is invalid', async () => {
      // Setup request with invalid rating
      const req = createMockRequest({
        params: { bookId: 'book123' },
        body: {
          text: 'Great book!',
          rating: '6' // Invalid: rating should be 1-5
        },
        user: { id: 'user456' }
      });
      const res = createMockResponse();
      
      // Call the controller
      await createReview(req as any, res as any);
      
      // Assertions
      expect(mockedCreateNewReview).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getBookReviews', () => {
    it('should return paginated reviews for a book', async () => {
      // Mock review data
      const mockReviews = [
        generateMockReview({ bookId: 'book123' }),
        generateMockReview({ bookId: 'book123' })
      ];
      
      // Mock service response - it returns an array of reviews, not a paginated object
      mockedGetReviewsByBook.mockResolvedValue(mockReviews as any);
      
      // Setup request
      const req = createMockRequest({
        params: { bookId: 'book123' },
        query: {
          page: '1',
          limit: '10'
        }
      });
      const res = createMockResponse();
      
      // Call the controller
      await getBookReviews(req as any, res as any);
      
      // Assertions
      expect(reviewService.getReviewsByBook).toHaveBeenCalledWith('book123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockReviews,
        error: null
      });
    });
  });
});
