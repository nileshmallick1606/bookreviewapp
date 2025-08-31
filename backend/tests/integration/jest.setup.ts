// tests/integration/jest.setup.ts
import '@jest/globals';
import dotenv from 'dotenv';

// Load environment variables from .env.test if available, otherwise .env
dotenv.config({ path: '.env.test' });

// Set NODE_ENV to test
process.env.NODE_ENV = 'test';

// Use test data directory for integration tests
process.env.DATA_DIR = './data/test';

// Configure mock server port
process.env.PORT = '5001';

// Configure test JWT secret
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';
process.env.JWT_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
