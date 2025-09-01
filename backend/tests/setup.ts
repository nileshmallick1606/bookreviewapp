/**
 * Global Jest setup file
 * This file runs before each test file to set up the test environment
 */

import { setupFileMocks, resetMockFileSystem } from './helpers/fileSystemMocks';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-token-secret';
process.env.JWT_EXPIRES_IN = '60m';
process.env.REFRESH_TOKEN_EXPIRES_IN = '7d';

// Mock external services if needed
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
  })
}));

// Global setup that runs before all tests
beforeAll(() => {
  // Initialize any global test state here
});

// Setup that runs before each test
beforeEach(() => {
  // Reset all mocks
  jest.clearAllMocks();
  
  // Reset the mock file system before each test
  resetMockFileSystem();
  
  // Set up file system mocks
  setupFileMocks();
});

// Teardown that runs after each test
afterEach(() => {
  // Additional cleanup if needed
});

// Global teardown that runs after all tests
afterAll(() => {
  // Cleanup global test state
  jest.restoreAllMocks();
});
