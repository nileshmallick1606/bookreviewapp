/**
 * Unit tests for Profile Service
 */

// Mock bcrypt before importing anything else that might use it
jest.mock('bcrypt', () => ({
  hash: jest.fn(() => Promise.resolve('hashed-password-mock')),
  compare: jest.fn(() => Promise.resolve(true)),
  genSalt: jest.fn(() => Promise.resolve('salt-mock'))
}));

// Mock dependencies fully before importing modules that use them
jest.mock('fs/promises', () => ({
  access: jest.fn(),
  mkdir: jest.fn(() => Promise.resolve()),
  readFile: jest.fn(),
  writeFile: jest.fn(() => Promise.resolve()),
  readdir: jest.fn(),
  unlink: jest.fn(() => Promise.resolve())
}));

jest.mock('path', () => ({
  resolve: jest.fn(),
  join: jest.fn((...args: any[]) => args.join('/')),
  basename: jest.fn((p: string) => p.split('/').pop())
}));

jest.mock('../../../src/services/userService', () => ({
  getUserById: jest.fn()
}));

import * as profileService from '../../../src/services/profileService';
import * as userService from '../../../src/services/userService';
import { User } from '../../../src/models/user';
import { jest, describe, beforeEach, it, expect, afterEach } from '@jest/globals';
import fs from 'fs/promises';
import path from 'path';

describe('Profile Service', () => {
  // Mock file system
  const mockFileSystem: Record<string, string> = {};
  
  // Constants
  const REVIEWS_DIR = 'mocked/data/reviews';
  const INDEXES_DIR = 'mocked/data/indexes';
  const USER_FAVORITES_INDEX = `${INDEXES_DIR}/user-favorites-index.json`;
  
  // Save original console.error
  const originalConsoleError = console.error;
  
  beforeEach(() => {
    // Mock console.error to reduce noise
    console.error = jest.fn();
    
    // Clear all mocks
    jest.clearAllMocks();
    
    // Reset mock filesystem
    Object.keys(mockFileSystem).forEach(key => delete mockFileSystem[key]);
    
    // Set up path.resolve mock
    (path.resolve as jest.Mock).mockImplementation((...args: any[]) => {
      const lastArg = args[args.length - 1];
      
      // Handle specific paths we care about in the tests
      if (args.includes('../../data/reviews')) {
        return REVIEWS_DIR;
      }
      if (args.includes('../../data/indexes')) {
        return INDEXES_DIR;
      }
      if (typeof lastArg === 'string' && lastArg.includes('user-favorites-index.json')) {
        return USER_FAVORITES_INDEX;
      }
      
      // Default case: join all path segments
      return args.join('/');
    });
    
    // Mock fs.access
    (fs.access as jest.Mock).mockImplementation(async (filePath: any) => {
      const p = filePath.toString();
      if (mockFileSystem[p]) {
        return Promise.resolve();
      }
      throw new Error(`ENOENT: no such file or directory, access '${p}'`);
    });
    
    // Mock fs.readFile
    (fs.readFile as jest.Mock).mockImplementation(async (filePath: any, options?: any) => {
      const p = filePath.toString();
      if (mockFileSystem[p]) {
        return mockFileSystem[p];
      }
      throw new Error(`ENOENT: no such file or directory, open '${p}'`);
    });
    
    // Mock fs.writeFile
    (fs.writeFile as jest.Mock).mockImplementation(async (filePath: any, data: any) => {
      const p = filePath.toString();
      mockFileSystem[p] = data.toString();
      return Promise.resolve();
    });
    
    // Mock fs.readdir
    (fs.readdir as jest.Mock).mockImplementation(async (dirPath: any) => {
      const p = dirPath.toString();
      if (p === REVIEWS_DIR) {
        return Object.keys(mockFileSystem)
          .filter(filePath => filePath.startsWith(REVIEWS_DIR + '/'))
          .map(filePath => filePath.split('/').pop() || '');
      }
      return [];
    });
  });
  
  afterEach(() => {
    // Restore console.error
    console.error = originalConsoleError;
  });
  
  // Helper to add a file to the mock filesystem
  const mockFile = (filePath: string, content: string) => {
    mockFileSystem[filePath] = content;
  };
  
  describe('getUserReviewCount', () => {
    it('should count user reviews', async () => {
      // Arrange
      const userId = 'test-user';
      
      // Mock the access function to succeed
      const mockAccess = fs.access as any;
      mockAccess.mockResolvedValueOnce();
      
      // Create mock review data
      const review1 = JSON.stringify({ userId, bookId: 'book1' });
      const review2 = JSON.stringify({ userId, bookId: 'book2' });
      const review3 = JSON.stringify({ userId: 'other-user', bookId: 'book3' });
      
      // Mock the readdir function to return our review files
      const mockReaddir = fs.readdir as any;
      mockReaddir.mockResolvedValueOnce(['review1.json', 'review2.json', 'review3.json']);
      
      // Mock path.join to return expected paths
      const mockJoin = path.join as any;
      mockJoin.mockImplementationOnce(() => `${REVIEWS_DIR}/review1.json`);
      mockJoin.mockImplementationOnce(() => `${REVIEWS_DIR}/review2.json`);
      mockJoin.mockImplementationOnce(() => `${REVIEWS_DIR}/review3.json`);
      
      // Mock readFile to return our review content
      const mockReadFile = fs.readFile as any;
      mockReadFile.mockResolvedValueOnce(review1);
      mockReadFile.mockResolvedValueOnce(review2);
      mockReadFile.mockResolvedValueOnce(review3);
      
      // Act
      const count = await profileService.getUserReviewCount(userId);
      
      // Assert
      expect(count).toBe(2);
    });
    
    it('should return 0 if user has no reviews', async () => {
      // Arrange
      const mockReaddir = fs.readdir as any;
      mockReaddir.mockResolvedValueOnce([]);
      
      // Act
      const count = await profileService.getUserReviewCount('user-with-no-reviews');
      
      // Assert
      expect(count).toBe(0);
    });
    
    it('should handle errors gracefully', async () => {
      // Arrange - force an error in readdir
      const mockReaddir = fs.readdir as any;
      mockReaddir.mockRejectedValueOnce(new Error('Failed to read directory'));
      
      // Act
      const count = await profileService.getUserReviewCount('any-user');
      
      // Assert - should return 0 instead of throwing
      expect(count).toBe(0);
    });
  });
  
  describe('getUserFavoriteCount', () => {
    it('should count user favorites', async () => {
      // Arrange
      const userId = 'user-with-favorites';
      
      // Create favorites index
      const favoritesData = JSON.stringify({
        [userId]: ['book1', 'book2', 'book3']
      });
      
      // Mock the access function to succeed
      const mockAccess = fs.access as any;
      mockAccess.mockResolvedValueOnce();
      
      // Make sure readFile returns correct data
      const mockReadFile = fs.readFile as any;
      mockReadFile.mockResolvedValueOnce(favoritesData);
      
      // Act
      const count = await profileService.getUserFavoriteCount(userId);
      
      // Assert
      expect(count).toBe(3);
    });
    
    it('should return 0 if user has no favorites', async () => {
      // Arrange
      const emptyFavoritesData = JSON.stringify({});
      mockFile(USER_FAVORITES_INDEX, emptyFavoritesData);
      
      // Make sure readFile returns correct data
      const mockReadFile = fs.readFile as any;
      mockReadFile.mockResolvedValueOnce(emptyFavoritesData);
      
      // Act
      const count = await profileService.getUserFavoriteCount('user-no-favorites');
      
      // Assert
      expect(count).toBe(0);
    });
    
    it('should handle errors gracefully', async () => {
      // Arrange - make access throw
      const mockAccess = fs.access as any;
      mockAccess.mockRejectedValueOnce(new Error('File not found'));
      
      // Act
      const count = await profileService.getUserFavoriteCount('any-user');
      
      // Assert - should return 0 instead of throwing
      expect(count).toBe(0);
    });
  });
  
  describe('getUserProfile', () => {
    it('should return user profile with stats', async () => {
      // Arrange
      const userId = 'profile-user';
      
      // Mock user
      const mockUser: User = {
        id: userId,
        email: 'profile@example.com',
        name: 'Profile User',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z'
      };
      
      // Set up getUserById mock
      const mockGetUserById = userService.getUserById as any;
      mockGetUserById.mockResolvedValueOnce(mockUser);
      
      // Instead of testing the real functions, let's mock the service functions directly
      // This approach is better for unit testing
      jest.spyOn(profileService, 'getUserReviewCount').mockResolvedValueOnce(2);
      jest.spyOn(profileService, 'getUserFavoriteCount').mockResolvedValueOnce(2);
      
      // Act
      const profile = await profileService.getUserProfile(userId);
      
      // Assert
      expect(profile).toEqual({
        user: mockUser,
        stats: {
          reviewCount: 2,
          favoriteCount: 2
        }
      });
    });
    
    it('should handle non-existent user', async () => {
      // Arrange
      const mockGetUserById = userService.getUserById as any;
      mockGetUserById.mockResolvedValueOnce(null);
      
      // Act
      const profile = await profileService.getUserProfile('non-existent');
      
      // Assert
      expect(profile).toEqual({
        user: null,
        stats: {
          reviewCount: 0,
          favoriteCount: 0
        }
      });
    });
    
    it('should throw error when service fails', async () => {
      // Arrange
      const mockGetUserById = userService.getUserById as any;
      mockGetUserById.mockRejectedValueOnce(new Error('User service error'));
      
      // Act & Assert
      await expect(profileService.getUserProfile('any-user'))
        .rejects.toThrow('Failed to get user profile');
    });
  });
});
