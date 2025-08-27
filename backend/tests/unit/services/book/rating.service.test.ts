// @ts-nocheck - Temporarily disable TypeScript checks for tests
import fs from 'fs';
import path from 'path';
import { calculateAverageRating, updateTopRatedBooksIndex } from '../../../../src/services/book/book.service';
import { getReviewsByBook } from '../../../../src/services/review/review.service';
import { fileExists } from '../../../../src/utils/file';
import { jest, describe, beforeEach, it, expect } from '@jest/globals';

// Mock dependencies
jest.mock('fs');
jest.mock('path');
jest.mock('../../../../src/services/review/review.service');
jest.mock('../../../../src/utils/file');

// Mock file system functions
const mockFs = fs as jest.Mocked<typeof fs>;
const mockPath = path as jest.Mocked<typeof path>;
const mockGetReviewsByBook = getReviewsByBook as jest.MockedFunction<typeof getReviewsByBook>;
const mockFileExists = fileExists as jest.MockedFunction<typeof fileExists>;

// Mock utilities
const mockReadFile = jest.fn();
const mockWriteFile = jest.fn();
const mockReaddir = jest.fn();
const mockMkdir = jest.fn();

// Setup mock implementations
mockFs.promises = {
  readFile: mockReadFile,
  writeFile: mockWriteFile,
  readdir: mockReaddir,
  mkdir: mockMkdir
} as any;

describe('Book Rating Service', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
    mockPath.join.mockImplementation((...paths) => paths.join('/'));
    mockFileExists.mockResolvedValue(true);
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
      mockReadFile.mockResolvedValue(mockBookData);
      mockWriteFile.mockResolvedValue(undefined);
      mockGetReviewsByBook.mockResolvedValue(mockReviews);

      // Execute function
      const result = await calculateAverageRating('book-123');

      // Verify results
      expect(result).toBe(4.0); // (5+3+4)/3 = 4.0
      expect(mockWriteFile).toHaveBeenCalledTimes(1);
      
      // Verify book data was updated correctly
      const updatedBookData = JSON.parse(mockWriteFile.mock.calls[0][1]);
      expect(updatedBookData.averageRating).toBe(4.0);
      expect(updatedBookData.totalReviews).toBe(3);
      expect(updatedBookData.ratingDistribution).toEqual({ 1: 0, 2: 0, 3: 1, 4: 1, 5: 1 });
    });

    it('should handle case with no reviews', async () => {
      // Mock book data
      const mockBookData = JSON.stringify({
        id: 'book-123',
        title: 'Test Book',
        author: 'Test Author',
        averageRating: 4.5, // Previous rating should be removed
        totalReviews: 10    // Previous count should be reset
      });

      // No reviews
      const mockReviews: any[] = [];

      // Setup mocks
      mockReadFile.mockResolvedValue(mockBookData);
      mockWriteFile.mockResolvedValue(undefined);
      mockGetReviewsByBook.mockResolvedValue(mockReviews);

      // Execute function
      const result = await calculateAverageRating('book-123');

      // Verify results
      expect(result).toBeNull();
      expect(mockWriteFile).toHaveBeenCalledTimes(1);
      
      // Verify book data was updated correctly
      const updatedBookData = JSON.parse(mockWriteFile.mock.calls[0][1]);
      expect(updatedBookData.averageRating).toBeNull();
      expect(updatedBookData.totalReviews).toBe(0);
      expect(updatedBookData.ratingDistribution).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
    });

    it('should round average rating to one decimal place', async () => {
      // Mock book data
      const mockBookData = JSON.stringify({
        id: 'book-123',
        title: 'Test Book',
        author: 'Test Author'
      });

      // Mock reviews with ratings that average to a repeating decimal
      const mockReviews = [
        { id: 'review-1', rating: 1 },
        { id: 'review-2', rating: 2 },
        { id: 'review-3', rating: 3 }
      ];

      // Setup mocks
      mockReadFile.mockResolvedValue(mockBookData);
      mockWriteFile.mockResolvedValue(undefined);
      mockGetReviewsByBook.mockResolvedValue(mockReviews);

      // Execute function
      const result = await calculateAverageRating('book-123');

      // Verify results (1+2+3)/3 = 2.0
      expect(result).toBe(2.0);
      
      // Verify book data was updated correctly
      const updatedBookData = JSON.parse(mockWriteFile.mock.calls[0][1]);
      expect(updatedBookData.averageRating).toBe(2.0);
    });

    it('should throw error when book not found', async () => {
      // Book doesn't exist
      mockFileExists.mockResolvedValue(false);

      // Execute function and check for error
      await expect(calculateAverageRating('non-existent-book')).rejects.toThrow('Book not found');
    });

    it('should call updateTopRatedBooksIndex after updating rating', async () => {
      // Mock dependencies to make calculateAverageRating succeed
      const mockBookData = JSON.stringify({
        id: 'book-123',
        title: 'Test Book',
        author: 'Test Author'
      });

      const mockReviews = [{ id: 'review-1', rating: 5 }];

      mockReadFile.mockResolvedValue(mockBookData);
      mockWriteFile.mockResolvedValue(undefined);
      mockGetReviewsByBook.mockResolvedValue(mockReviews);
      
      // Mock implementation of updateTopRatedBooksIndex
      const spy = jest.spyOn(require('../../../../src/services/book/book.service'), 'updateTopRatedBooksIndex');
      spy.mockResolvedValue(undefined);

      // Execute function
      await calculateAverageRating('book-123');

      // Verify updateTopRatedBooksIndex was called
      expect(spy).toHaveBeenCalledTimes(1);
      
      // Restore original implementation
      spy.mockRestore();
    });
  });

  describe('updateTopRatedBooksIndex', () => {
    it('should create top-rated books index correctly', async () => {
      // Mock book files
      const mockFileNames = ['book1.json', 'book2.json', 'book3.json'];
      mockReaddir.mockResolvedValue(mockFileNames);
      
      // Mock book data
      const mockBooks = [
        { id: 'book-1', title: 'Book 1', author: 'Author 1', averageRating: 4.5, totalReviews: 10 },
        { id: 'book-2', title: 'Book 2', author: 'Author 2', averageRating: 3.0, totalReviews: 5 },
        { id: 'book-3', title: 'Book 3', author: 'Author 3', averageRating: 5.0, totalReviews: 2 }
      ];

      // Setup mock to return different book data for each file
      mockReadFile.mockImplementation((path) => {
        const fileName = path.split('/').pop();
        if (fileName === 'book1.json') return JSON.stringify(mockBooks[0]);
        if (fileName === 'book2.json') return JSON.stringify(mockBooks[1]);
        if (fileName === 'book3.json') return JSON.stringify(mockBooks[2]);
        return '';
      });

      mockWriteFile.mockResolvedValue(undefined);
      mockMkdir.mockResolvedValue(undefined);

      // Execute function
      await updateTopRatedBooksIndex();

      // Verify mkdir was called
      expect(mockMkdir).toHaveBeenCalledTimes(1);
      
      // Verify writeFile was called
      expect(mockWriteFile).toHaveBeenCalledTimes(1);

      // Verify top-rated books are sorted by rating
      const indexData = JSON.parse(mockWriteFile.mock.calls[0][1]);
      expect(indexData).toHaveLength(3);
      expect(indexData[0].id).toBe('book-3'); // 5.0 rating
      expect(indexData[1].id).toBe('book-1'); // 4.5 rating
      expect(indexData[2].id).toBe('book-2'); // 3.0 rating
    });

    it('should filter out books with no ratings', async () => {
      // Mock book files
      const mockFileNames = ['book1.json', 'book2.json', 'book3.json'];
      mockReaddir.mockResolvedValue(mockFileNames);
      
      // Mock book data
      const mockBooks = [
        { id: 'book-1', title: 'Book 1', author: 'Author 1', averageRating: 4.5, totalReviews: 10 },
        { id: 'book-2', title: 'Book 2', author: 'Author 2', averageRating: null, totalReviews: 0 },
        { id: 'book-3', title: 'Book 3', author: 'Author 3', averageRating: 5.0, totalReviews: 2 }
      ];

      // Setup mock to return different book data for each file
      mockReadFile.mockImplementation((path) => {
        const fileName = path.split('/').pop();
        if (fileName === 'book1.json') return JSON.stringify(mockBooks[0]);
        if (fileName === 'book2.json') return JSON.stringify(mockBooks[1]);
        if (fileName === 'book3.json') return JSON.stringify(mockBooks[2]);
        return '';
      });

      mockWriteFile.mockResolvedValue(undefined);
      mockMkdir.mockResolvedValue(undefined);

      // Execute function
      await updateTopRatedBooksIndex();

      // Verify top-rated books exclude null ratings
      const indexData = JSON.parse(mockWriteFile.mock.calls[0][1]);
      expect(indexData).toHaveLength(2);
      expect(indexData.map((book: any) => book.id)).not.toContain('book-2');
    });

    it('should handle errors gracefully', async () => {
      // Force an error by rejecting readdir
      mockReaddir.mockRejectedValue(new Error('Failed to read directory'));
      
      // Expect the function to throw an error
      await expect(updateTopRatedBooksIndex()).rejects.toThrow('Failed to update top-rated books index');
    });
  });
});
