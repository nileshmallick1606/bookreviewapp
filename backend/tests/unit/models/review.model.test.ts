/**
 * Unit tests for Review Model
 */

import { Review, createReview } from '../../../src/models/review/review.model';
import { generateMockReview } from '../../helpers/mockDataGenerators';
import { v4 as uuidv4 } from 'uuid';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import path from 'path';

jest.mock('uuid');
jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/'))
}));

describe('Review Model Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (uuidv4 as jest.Mock).mockReturnValue('mock-review-12345');
  });
  
  it('dummy test to avoid empty suite error', () => {
    expect(1).toBe(1);
  });
  
  describe('createReview function', () => {
    it('should create a valid review with generated ID', () => {
      // Setup
      const reviewData = {
        bookId: 'book-123',
        userId: 'user-456',
        rating: 4,
        text: 'This is a great book!',
        imageUrls: []
      };
      
      const now = new Date();
      const isoString = now.toISOString();
      jest.spyOn(global, 'Date').mockImplementation(() => now as any);
      
      // Execute
      const result = createReview(reviewData);
      
      // Assert
      expect(result).toEqual({
        id: 'mock-review-12345',
        bookId: 'book-123',
        userId: 'user-456',
        rating: 4,
        text: 'This is a great book!',
        imageUrls: [],
        likes: [],
        comments: [],
        createdAt: isoString,
        updatedAt: isoString
      });
    });
    
    it('should set default empty array for imageUrls if not provided', () => {
      // Setup
      const reviewData = {
        bookId: 'book-123',
        userId: 'user-456',
        rating: 4,
        text: 'This is a great book!'
        // No imageUrls provided
      };
      
      // Execute
      const result = createReview(reviewData);
      
      // Assert
      expect(result.imageUrls).toEqual([]);
    });
  });
});
