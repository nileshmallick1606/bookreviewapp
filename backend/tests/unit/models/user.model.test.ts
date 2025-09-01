/**
 * Unit tests for User Model
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { setupFileMocks, resetMockFileSystem, addMockFile } from '../../helpers/fileSystemMocks';
import { createUser, toUserResponse, User, UserInput } from '../../../src/models/user';

jest.mock('uuid');
jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/'))
}));

describe('User Model Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetMockFileSystem();
    setupFileMocks();
    (uuidv4 as jest.Mock).mockReturnValue('mock-user-12345');
  });

  describe('createUser', () => {
    it('should create a valid user with required fields only', () => {
      const userInput: UserInput = {
        email: 'test@example.com',
        name: 'Test User'
      };
      
      const user = createUser(userInput);
      
      expect(user).toEqual({
        id: 'mock-user-12345',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      });
    });

    it('should create a user with password when provided', () => {
      const userInput: UserInput = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword123'
      };
      
      const user = createUser(userInput);
      
      expect(user.password).toBe('hashedPassword123');
    });
    
    it('should create a user with social provider when provided', () => {
      const userInput: UserInput = {
        email: 'test@example.com',
        name: 'Test User',
        socialProvider: {
          provider: 'google',
          providerId: 'google-123456'
        }
      };
      
      const user = createUser(userInput);
      
      expect(user.socialProviders).toEqual([{
        provider: 'google',
        providerId: 'google-123456'
      }]);
    });
    
    it('should create a user with genre preferences when provided', () => {
      const userInput: UserInput = {
        email: 'test@example.com',
        name: 'Test User',
        genrePreferences: ['Fiction', 'Mystery', 'Sci-Fi']
      };
      
      const user = createUser(userInput);
      
      expect(user.genrePreferences).toEqual(['Fiction', 'Mystery', 'Sci-Fi']);
    });
    
    it('should convert email to lowercase', () => {
      const userInput: UserInput = {
        email: 'Test@Example.COM',
        name: 'Test User'
      };
      
      const user = createUser(userInput);
      
      expect(user.email).toBe('test@example.com');
    });
  });

  describe('toUserResponse', () => {
    it('should remove password from user object', () => {
      const user: User = {
        id: 'user-123',
        email: 'test@example.com',
        password: 'hashedPassword123',
        name: 'Test User',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z'
      };
      
      const userResponse = toUserResponse(user);
      
      expect(userResponse).not.toHaveProperty('password');
      expect(userResponse).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z'
      });
    });
    
    it('should preserve optional properties in user response', () => {
      const user: User = {
        id: 'user-123',
        email: 'test@example.com',
        password: 'hashedPassword123',
        name: 'Test User',
        profilePicture: 'https://example.com/pic.jpg',
        genrePreferences: ['Fiction', 'Sci-Fi'],
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z'
      };
      
      const userResponse = toUserResponse(user);
      
      expect(userResponse).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        profilePicture: 'https://example.com/pic.jpg',
        genrePreferences: ['Fiction', 'Sci-Fi'],
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z'
      });
    });
  });

  // We would add more tests here based on the actual User model functionality
});
