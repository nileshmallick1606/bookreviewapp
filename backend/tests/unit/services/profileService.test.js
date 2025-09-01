/**
 * Unit tests for Profile Service
 */

// Mock bcrypt before importing anything else that might use it
jest.mock('bcrypt', () => ({
  hash: jest.fn(() => Promise.resolve('hashed-password-mock')),
  compare: jest.fn(() => Promise.resolve(true)),
  genSalt: jest.fn(() => Promise.resolve('salt-mock'))
}));

// We need to mock these modules before importing profileService
jest.mock('fs/promises');
jest.mock('path');
jest.mock('../../../src/services/userService');

// Now import the modules we need to test
const profileService = require('../../../src/services/profileService');
const userService = require('../../../src/services/userService');
const fs = require('fs/promises');
const path = require('path');

describe('Profile Service', () => {
  // Mock file system
  const mockFileSystem = {};
  
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
    path.resolve.mockImplementation((...args) => {
      if (args.includes('../../data/reviews')) {
        return REVIEWS_DIR;
      }
      if (args.includes('../../data/indexes')) {
        return INDEXES_DIR;
      }
      const lastArg = args[args.length - 1];
      if (typeof lastArg === 'string' && lastArg.includes('user-favorites-index.json')) {
        return USER_FAVORITES_INDEX;
      }
      return args.join('/');
    });
    
    path.join.mockImplementation((...args) => args.join('/'));
    
    // Mock fs.access
    fs.access.mockImplementation(async (filePath) => {
      const p = filePath.toString();
      if (mockFileSystem[p]) {
        return Promise.resolve();
      }
      throw new Error(`ENOENT: no such file or directory, access '${p}'`);
    });
    
    // Mock fs.readFile
    fs.readFile.mockImplementation(async (filePath, options) => {
      const p = filePath.toString();
      if (mockFileSystem[p]) {
        return mockFileSystem[p];
      }
      throw new Error(`ENOENT: no such file or directory, open '${p}'`);
    });
    
    // Mock fs.writeFile
    fs.writeFile.mockImplementation(async (filePath, data) => {
      const p = filePath.toString();
      mockFileSystem[p] = data.toString();
      return Promise.resolve();
    });
    
    // Mock fs.readdir
    fs.readdir.mockImplementation(async (dirPath) => {
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
  const mockFile = (filePath, content) => {
    mockFileSystem[filePath] = content;
  };
  
  describe('getUserReviewCount', () => {
    it('should count user reviews', async () => {
      // Arrange
      const userId = 'test-user';
      
      // Create mock review files
      mockFile(`${REVIEWS_DIR}/review1.json`, JSON.stringify({ userId, bookId: 'book1' }));
      mockFile(`${REVIEWS_DIR}/review2.json`, JSON.stringify({ userId, bookId: 'book2' }));
      mockFile(`${REVIEWS_DIR}/review3.json`, JSON.stringify({ userId: 'other-user', bookId: 'book3' }));
      
      // Make sure readdir returns the correct file list
      fs.readdir.mockResolvedValueOnce(['review1.json', 'review2.json', 'review3.json']);
      
      // Make sure path.join works as expected for review files
      path.join.mockImplementation((...args) => {
        if (args[0] === REVIEWS_DIR) {
          return `${REVIEWS_DIR}/${args[1]}`;
        }
        return args.join('/');
      });
      
      // Act
      const count = await profileService.getUserReviewCount(userId);
      
      // Assert
      expect(count).toBe(2);
    });
    
    it('should return 0 if user has no reviews', async () => {
      // Arrange
      fs.readdir.mockResolvedValueOnce([]);
      
      // Act
      const count = await profileService.getUserReviewCount('user-with-no-reviews');
      
      // Assert
      expect(count).toBe(0);
    });
    
    it('should handle errors gracefully', async () => {
      // Arrange - force an error in readdir
      fs.readdir.mockRejectedValueOnce(new Error('Failed to read directory'));
      
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
      mockFile(USER_FAVORITES_INDEX, favoritesData);
      
      // Make sure access and readFile return correct data
      fs.access.mockResolvedValueOnce();
      fs.readFile.mockResolvedValueOnce(favoritesData);
      
      // Act
      const count = await profileService.getUserFavoriteCount(userId);
      
      // Assert
      expect(count).toBe(3);
    });
    
    it('should return 0 if user has no favorites', async () => {
      // Arrange
      const emptyFavoritesData = JSON.stringify({});
      mockFile(USER_FAVORITES_INDEX, emptyFavoritesData);
      
      // Make sure access and readFile return correct data
      fs.access.mockResolvedValueOnce();
      fs.readFile.mockResolvedValueOnce(emptyFavoritesData);
      
      // Act
      const count = await profileService.getUserFavoriteCount('user-no-favorites');
      
      // Assert
      expect(count).toBe(0);
    });
    
    it('should handle errors gracefully', async () => {
      // Arrange - make access throw
      fs.access.mockRejectedValueOnce(new Error('File not found'));
      
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
      const mockUser = {
        id: userId,
        email: 'profile@example.com',
        name: 'Profile User',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z'
      };
      
      // Set up getUserById mock
      userService.getUserById.mockResolvedValueOnce(mockUser);
      
      // Mock review count
      const reviewFiles = ['review1.json', 'review2.json'];
      fs.readdir.mockResolvedValueOnce(reviewFiles);
      
      // Set up review files
      reviewFiles.forEach((file, index) => {
        mockFile(`${REVIEWS_DIR}/${file}`, JSON.stringify({ 
          userId, 
          bookId: `book${index + 1}` 
        }));
        
        // Make path.join work for reviews
        path.join.mockImplementationOnce((dir, filename) => `${dir}/${filename}`);
      });
      
      // Mock favorites count
      const favoritesData = JSON.stringify({
        [userId]: ['book1', 'book3']
      });
      mockFile(USER_FAVORITES_INDEX, favoritesData);
      fs.access.mockResolvedValueOnce();
      fs.readFile.mockResolvedValueOnce(favoritesData);
      
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
      userService.getUserById.mockResolvedValueOnce(null);
      
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
      userService.getUserById.mockRejectedValueOnce(new Error('User service error'));
      
      // Act & Assert
      await expect(profileService.getUserProfile('any-user'))
        .rejects.toThrow('Failed to get user profile');
    });
  });
});
