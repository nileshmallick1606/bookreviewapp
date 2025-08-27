// @ts-nocheck - Temporarily disable TypeScript checks for tests
import { BookModel } from '../../../src/models/book';
import fs from 'fs';
import path from 'path';
import { fileExists } from '../../../src/utils/file';
import { jest, describe, beforeEach, it, expect } from '@jest/globals';

// Mock dependencies
jest.mock('fs');
jest.mock('path');
jest.mock('../../../src/utils/file');

// Mock file system functions
const mockFs = fs as jest.Mocked<typeof fs>;
const mockPath = path as jest.Mocked<typeof path>;
const mockFileExists = fileExists as jest.MockedFunction<typeof fileExists>;

// Mock utilities
const mockReadFile = jest.fn();
const mockWriteFile = jest.fn();
const mockReaddir = jest.fn();

// Setup mock implementations
mockFs.promises = {
  readFile: mockReadFile,
  writeFile: mockWriteFile,
  readdir: mockReaddir
} as any;

describe('Book Model', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockPath.join.mockImplementation((...paths) => paths.join('/'));
    mockFileExists.mockResolvedValue(true);
  });

  describe('getBookById', () => {
    it('should return book with rating information', async () => {
      // Mock book data with rating properties
      const mockBook = {
        id: 'book123',
        title: 'Test Book',
        author: 'Test Author',
        averageRating: 4.5,
        totalReviews: 10,
        ratingDistribution: { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 }
      };

      // Setup mocks
      mockReadFile.mockResolvedValue(JSON.stringify(mockBook));

      // Call the method
      const result = await BookModel.getBookById('book123');

      // Verify result contains rating information
      expect(result).toEqual(mockBook);
      expect(result.averageRating).toBe(4.5);
      expect(result.totalReviews).toBe(10);
      expect(result.ratingDistribution).toEqual({ 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 });
    });

    it('should handle book with no ratings', async () => {
      // Mock book data without rating properties
      const mockBook = {
        id: 'book123',
        title: 'Test Book',
        author: 'Test Author',
        // No rating properties
      };

      // Setup mocks
      mockReadFile.mockResolvedValue(JSON.stringify(mockBook));

      // Call the method
      const result = await BookModel.getBookById('book123');

      // Verify result
      expect(result).toEqual(mockBook);
      expect(result.averageRating).toBeUndefined();
      expect(result.totalReviews).toBeUndefined();
    });
  });

  describe('getBooks', () => {
    it('should return books sorted by rating when requested', async () => {
      // Mock book files
      const mockFileNames = ['book1.json', 'book2.json', 'book3.json'];
      mockReaddir.mockResolvedValue(mockFileNames);
      
      // Mock book data with different ratings
      const mockBooks = [
        { id: 'book1', title: 'Book 1', averageRating: 3.5 },
        { id: 'book2', title: 'Book 2', averageRating: 5.0 },
        { id: 'book3', title: 'Book 3', averageRating: 4.0 }
      ];

      // Setup mock to return different book data for each file
      mockReadFile.mockImplementation((path) => {
        const fileName = path.split('/').pop();
        if (fileName === 'book1.json') return JSON.stringify(mockBooks[0]);
        if (fileName === 'book2.json') return JSON.stringify(mockBooks[1]);
        if (fileName === 'book3.json') return JSON.stringify(mockBooks[2]);
        return '';
      });

      // Call the method with sort by rating
      const result = await BookModel.getBooks(1, 10, 'averageRating', 'desc');

      // Verify results are sorted by rating (highest first)
      expect(result.books).toHaveLength(3);
      expect(result.books[0].id).toBe('book2'); // 5.0 rating
      expect(result.books[1].id).toBe('book3'); // 4.0 rating
      expect(result.books[2].id).toBe('book1'); // 3.5 rating
    });
    
    it('should handle books with null ratings when sorting', async () => {
      // Mock book files
      const mockFileNames = ['book1.json', 'book2.json', 'book3.json'];
      mockReaddir.mockResolvedValue(mockFileNames);
      
      // Mock book data with some null ratings
      const mockBooks = [
        { id: 'book1', title: 'Book 1', averageRating: null },
        { id: 'book2', title: 'Book 2', averageRating: 4.5 },
        { id: 'book3', title: 'Book 3', averageRating: null }
      ];

      // Setup mock to return different book data for each file
      mockReadFile.mockImplementation((path) => {
        const fileName = path.split('/').pop();
        if (fileName === 'book1.json') return JSON.stringify(mockBooks[0]);
        if (fileName === 'book2.json') return JSON.stringify(mockBooks[1]);
        if (fileName === 'book3.json') return JSON.stringify(mockBooks[2]);
        return '';
      });

      // Call the method with sort by rating
      const result = await BookModel.getBooks(1, 10, 'averageRating', 'desc');

      // Verify books with ratings come first, null ratings last
      expect(result.books).toHaveLength(3);
      expect(result.books[0].id).toBe('book2'); // 4.5 rating
      
      // The null ratings should come last but their order is not guaranteed
      // We just check that they're both in the last two positions
      expect(['book1', 'book3']).toContain(result.books[1].id);
      expect(['book1', 'book3']).toContain(result.books[2].id);
    });
  });
});
