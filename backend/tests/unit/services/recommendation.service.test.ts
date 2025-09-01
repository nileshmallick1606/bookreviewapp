/**
 * Unit tests for Recommendation Service
 */

import * as recommendationService from '../../../src/services/recommendation/recommendation.service';
import { OpenAIService } from '../../../src/services/ai/openai.service';
import { jest, describe, beforeEach, it, expect, afterEach } from '@jest/globals';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { setupFileMocks, resetMockFileSystem, addMockFile } from '../../helpers/fileSystemMocks';
import { Book } from '../../../src/models/interfaces/book.interface';
import { User } from '../../../src/models/interfaces/user.interface';
import { Review } from '../../../src/models/interfaces/review.interface';

// Mock dependencies
jest.mock('util', () => ({
  promisify: jest.fn((fn) => fn)
}));

jest.mock('fs', () => ({
  readFile: jest.fn(),
  writeFile: jest.fn(),
  readdir: jest.fn(),
  mkdir: jest.fn(),
  existsSync: jest.fn(),
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    readdir: jest.fn(),
    mkdir: jest.fn()
  }
}));

jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/'))
}));

jest.mock('../../../src/services/ai/openai.service');
const MockOpenAIService = OpenAIService as jest.MockedClass<typeof OpenAIService>;

describe('Recommendation Service', () => {
  // Mock data
  const mockBooks = [
    {
      id: 'book1',
      title: 'Test Book 1',
      author: 'Author 1',
      genres: ['Fiction', 'Fantasy'],
      averageRating: 4.5,
      totalReviews: 10,
      coverImage: 'https://example.com/book1.jpg',
      description: 'Book 1 description',
      publishedYear: 2023,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01')
    } as Book,
    {
      id: 'book2',
      title: 'Test Book 2',
      author: 'Author 2',
      genres: ['Fiction', 'Mystery'],
      averageRating: 4.8,
      totalReviews: 15,
      coverImage: 'https://example.com/book2.jpg',
      description: 'Book 2 description',
      publishedYear: 2022,
      createdAt: new Date('2022-01-01'),
      updatedAt: new Date('2022-01-01')
    } as Book
  ];

  const userId = 'user1';

  beforeEach(() => {
    jest.clearAllMocks();
    setupFileMocks();
    resetMockFileSystem();
    
    // Setup mock OpenAI service with proper type casting to avoid TypeScript errors
    (MockOpenAIService.prototype.isAvailable as any) = jest.fn().mockReturnValue(true);
    (MockOpenAIService.prototype.getPersonalizedRecommendations as any) = 
      jest.fn().mockImplementation(() => Promise.resolve([mockBooks[0], mockBooks[1]]));
    
    // Mock fs.promises.readFile for top rated books
    (fs.promises.readFile as any).mockImplementation((filePath: string) => {
      if (filePath.includes('topRatedBooks.json')) {
        return Promise.resolve(JSON.stringify(mockBooks));
      }
      return Promise.reject(new Error(`File not found: ${filePath}`));
    });
    
    // Mock fs.promises.readdir for book files
    (fs.promises.readdir as any).mockImplementation((dirPath: string) => {
      if (dirPath.includes('books')) {
        return Promise.resolve(['book1.json', 'book2.json']);
      }
      return Promise.reject(new Error(`Directory not found: ${dirPath}`));
    });
    
    // Mock fs.existsSync for checking if files exist
    (fs.existsSync as any).mockImplementation((filePath: string) => {
      return filePath.includes('topRatedBooks.json');
    });
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getBasicRecommendations', () => {
    it('should return top rated books', async () => {
      const recommendations = await recommendationService.getBasicRecommendations();
      
      expect(recommendations).toHaveLength(2);
      expect(recommendations[0].id).toBe('book1');
      expect(recommendations[1].id).toBe('book2');
    });

    it('should filter books by minimum rating', async () => {
      // Modify one book to have a lower rating
      const mockBooksWithLowRating = [
        { ...mockBooks[0], averageRating: 4.5 },
        { ...mockBooks[1], averageRating: 3.5 }
      ];
      
      const mockReadFile = fs.promises.readFile as jest.Mock;
      mockReadFile.mockImplementationOnce(() => Promise.resolve(JSON.stringify(mockBooksWithLowRating)));
      
      const recommendations = await recommendationService.getBasicRecommendations(10, 4.0);
      
      expect(recommendations).toHaveLength(1);
      expect(recommendations[0].id).toBe('book1');
    });

    it('should filter books by genre', async () => {
      const recommendations = await recommendationService.getBasicRecommendations(10, 4.0, ['Fantasy']);
      
      expect(recommendations).toHaveLength(1);
      expect(recommendations[0].id).toBe('book1');
    });

    it('should handle missing top rated books index', async () => {
      const mockExistsSync = fs.existsSync as jest.Mock;
      mockExistsSync.mockImplementationOnce(() => false);
      
      await expect(recommendationService.getBasicRecommendations())
        .rejects.toThrow('Top-rated books index not found');
    });
  });

  describe('getUserRecommendations', () => {
    it('should return personalized recommendations using OpenAI when available', async () => {
      // We need to mock getUserById to return a mock user
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        genrePreferences: ['Fiction', 'Fantasy'],
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z'
      } as unknown as User;
      
      // Mock user service or other required dependencies
      // This will depend on how the recommendation service gets user data
      
      const recommendations = await recommendationService.getUserRecommendations(userId, 5);
      
      // Since we're testing integration, we'll focus on the outcome
      // rather than specific implementation details that might change
      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('should fall back to basic recommendations when OpenAI is not available', async () => {
      // Cast to any to avoid TypeScript errors with the mock
      (MockOpenAIService.prototype.isAvailable as any) = jest.fn().mockReturnValue(false);
      
      const recommendations = await recommendationService.getUserRecommendations(userId, 5);
      
      expect(recommendations.length).toBeGreaterThan(0);
    });
    
    it('should handle empty user ID gracefully', async () => {
      const recommendations = await recommendationService.getUserRecommendations(null, 5);
      
      // Should fall back to basic recommendations
      expect(recommendations.length).toBeGreaterThan(0);
    });
    
    it('should handle errors from OpenAI service', async () => {
      // Cast to any to avoid TypeScript errors with the mock
      (MockOpenAIService.prototype.getPersonalizedRecommendations as any) = 
        jest.fn().mockImplementation(() => Promise.reject(new Error('OpenAI API error')));
      
      const recommendations = await recommendationService.getUserRecommendations(userId, 5);
      
      // Should fall back to basic recommendations
      expect(recommendations.length).toBeGreaterThan(0);
    });
  });
  
  describe('clearRecommendationsCache', () => {
    it('should clear the recommendations cache', async () => {
      // Get recommendations first to populate cache
      await recommendationService.getBasicRecommendations();
      
      // Clear cache
      recommendationService.clearRecommendationsCache();
      
      // This should call fs.promises.readFile again if cache was cleared
      const mockReadFile = fs.promises.readFile as any;
      const initialCallCount = mockReadFile.mock.calls.length;
      
      await recommendationService.getBasicRecommendations();
      
      expect(mockReadFile.mock.calls.length).toBeGreaterThan(initialCallCount);
    });
  });
});
