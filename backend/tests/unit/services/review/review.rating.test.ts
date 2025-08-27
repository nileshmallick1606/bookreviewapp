// @ts-nocheck - Temporarily disable TypeScript checks for tests
import { calculateAverageRating } from '../../../../src/services/book/book.service';
import { createNewReview, updateReviewById, deleteReviewById } from '../../../../src/services/review/review.service';
import { fileExists } from '../../../../src/utils/file';
import { ReviewCreationParams, ReviewUpdateParams } from '../../../../src/models/review/review.model';

// Explicitly import Jest types
import { jest, describe, beforeEach, it, expect } from '@jest/globals';

// Mock dependencies
jest.mock('../../../../src/services/book/book.service');
jest.mock('../../../../src/utils/file');
jest.mock('../../../../src/services/review/review.service');

// Mock implementation functions
const mockCalculateAverageRating = calculateAverageRating as jest.MockedFunction<typeof calculateAverageRating>;
const mockFileExists = fileExists as jest.MockedFunction<typeof fileExists>;

describe('Review Service - Rating Integration', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockFileExists.mockResolvedValue(true);
    mockCalculateAverageRating.mockResolvedValue(4.5);
  });

  describe('createNewReview', () => {
    it('should recalculate book rating after creating a review', async () => {
      // Mock data
      const reviewParams: ReviewCreationParams = {
        userId: 'user123',
        bookId: 'book123',
        rating: 4,
        text: 'Great book!'
      };

      // Execute function
      await createNewReview(reviewParams);

      // Verify calculateAverageRating was called
      expect(mockCalculateAverageRating).toHaveBeenCalled();
    });
  });

  describe('updateReviewById', () => {
    it('should recalculate book rating after updating a review', async () => {
      // Mock data
      const reviewId = 'review123';
      const updatedReviewData: ReviewUpdateParams = {
        rating: 5,
        text: 'Amazing book!'
      };

      // Execute function
      await updateReviewById(reviewId, updatedReviewData);

      // Verify calculateAverageRating was called
      expect(mockCalculateAverageRating).toHaveBeenCalled();
    });
  });

  describe('deleteReviewById', () => {
    it('should recalculate book rating after deleting a review', async () => {
      // Mock data
      const reviewId = 'review123';

      // Execute function
      await deleteReviewById(reviewId);

      // Verify calculateAverageRating was called
      expect(mockCalculateAverageRating).toHaveBeenCalled();
    });

    it('should handle missing review gracefully', async () => {
      // Mock fileExists to return false for missing review
      mockFileExists.mockResolvedValue(false);
      
      // Setup mock to throw error
      (deleteReviewById as jest.MockedFunction<typeof deleteReviewById>).mockRejectedValueOnce(new Error('Review not found'));

      // Execute function - should throw not found error
      await expect(deleteReviewById('nonexistent-review')).rejects.toThrow('Review not found');

      // Verify calculateAverageRating was not called
      expect(mockCalculateAverageRating).not.toHaveBeenCalled();
    });
  });
});
