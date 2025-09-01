/**
 * Tests for User Controller
 */

import { getUserByIdController, getProfileController } from '../../../src/controllers/user.controller';
import * as userService from '../../../src/services/userService';
import * as profileService from '../../../src/services/profileService';
import { createMockRequest, createMockResponse } from '../../helpers/expressTestUtils';
import {jest, describe, beforeEach, it, expect} from '@jest/globals';

// Import User type and ProfileStats
import { User } from '../../../src/models/user';
import { ProfileStats } from '../../../src/services/profileService';

// Define the profile response interface to match the service
interface UserProfileResponse {
  user: User | null;
  stats: ProfileStats;
}

// Mock the services
jest.mock('../../../src/services/userService');
jest.mock('../../../src/services/profileService');

// Add properly typed mock functions
const mockedGetUserById = userService.getUserById as jest.MockedFunction<typeof userService.getUserById>;
const mockedGetUserProfile = profileService.getUserProfile as jest.MockedFunction<typeof profileService.getUserProfile>;

describe('User Controller', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserByIdController', () => {
    it('should return user data when user exists', async () => {
      // Mock user data
      const mockUser = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com', // Should not be returned to client
        profilePicture: 'profile.jpg',
        genrePreferences: ['fiction', 'mystery'],
        createdAt: '2025-08-15T10:30:00.000Z',
        password: 'hashedpassword' // Should not be returned to client
      };
      
      // Setup the mock implementation
      mockedGetUserById.mockResolvedValue(mockUser as any);
      
      // Create mock request and response
      const req = createMockRequest({
        params: { id: '123' }
      });
      const res = createMockResponse();
      
      // Call the controller function
      await getUserByIdController(req as any, res as any);
      
      // Assertions
      expect(mockedGetUserById).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          id: '123',
          name: 'Test User',
          profilePicture: 'profile.jpg',
          genrePreferences: ['fiction', 'mystery'],
          createdAt: '2025-08-15T10:30:00.000Z'
        },
        error: null
      });
      
      // Verify sensitive data is not returned
      const responseData = (res.json as jest.Mock).mock.calls[0][0] as { 
        status: string; 
        data: any; 
        error: null 
      };
      expect(responseData.data).not.toHaveProperty('email');
      expect(responseData.data).not.toHaveProperty('password');
    });
    
    it('should return 404 when user does not exist', async () => {
      // Setup the mock implementation to return null (user not found)
      mockedGetUserById.mockResolvedValue(null);
      
      // Create mock request and response
      const req = createMockRequest({
        params: { id: 'nonexistent-id' }
      });
      const res = createMockResponse();
      
      // Call the controller function
      await getUserByIdController(req as any, res as any);
      
      // Assertions
      expect(mockedGetUserById).toHaveBeenCalledWith('nonexistent-id');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        error: { code: 404, message: 'User not found' },
        data: null
      });
    });
    
    it('should return 500 when service throws an error', async () => {
      // Mock console.error to prevent error output in test results
      const originalConsoleError = console.error;
      console.error = jest.fn();
      
      // Setup the mock implementation to throw an error
      mockedGetUserById.mockRejectedValue(new Error('Database error'));
      
      // Create mock request and response
      const req = createMockRequest({
        params: { id: '123' }
      });
      const res = createMockResponse();
      
      // Call the controller function
      await getUserByIdController(req as any, res as any);
      
      // Restore console.error
      console.error = originalConsoleError;
      
      // Assertions
      expect(mockedGetUserById).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        error: { code: 500, message: 'Failed to get user data' },
        data: null
      });
    });
  });

  describe('getProfileController', () => {
    it('should return user profile with stats when user exists', async () => {
      // Mock profile data
      const mockProfile = {
        user: {
          id: '123',
          name: 'Test User',
          email: undefined,
          profilePicture: 'profile.jpg',
          createdAt: '2025-08-15T10:30:00.000Z',
          genrePreferences: [],
          stats: {
            reviewCount: 5,
            favoritesCount: 10
          }
        }
      };
      
      // Setup the mock implementation
      mockedGetUserProfile.mockResolvedValue({
        user: {
          id: '123',
          name: 'Test User',
          profilePicture: 'profile.jpg',
          createdAt: '2025-08-15T10:30:00.000Z'
        },
        stats: {
          reviewCount: 5,
          favoritesCount: 10
        }
      } as unknown as UserProfileResponse);
      
      // Create mock request and response
      const req = createMockRequest({
        params: { id: '123' }
      });
      const res = createMockResponse();
      
      // Call the controller function
      await getProfileController(req as any, res as any);
      
      // Assertions
      expect(mockedGetUserProfile).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockProfile.user,
        error: null
      });
    });
    
    // Additional tests for error cases would go here
  });
});
