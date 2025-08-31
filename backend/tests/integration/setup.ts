// tests/integration/setup.ts
import { Server } from 'http';
import express from 'express';
import request from 'supertest';
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import path from 'path';
import fs from 'fs/promises';

// Import app but don't start the server
import { setupApp } from '../../src/app';

let server: Server;
let app: express.Application;

/**
 * Setup test environment before all tests
 */
export const setupTestEnvironment = async (): Promise<void> => {
  // Create app instance without starting server
  app = await setupApp();
  
  // Clean up test data directories
  await cleanTestDataDirectories();
  
  // Seed test data
  await seedTestData();
};

/**
 * Clean up test environment after all tests
 */
export const teardownTestEnvironment = async (): Promise<void> => {
  // Clean up test data directories
  await cleanTestDataDirectories();
};

/**
 * Create a supertest request object for the app
 */
export const getRequest = (): request.SuperTest<request.Test> => {
  return request(app);
};

/**
 * Generate a valid JWT token for testing
 */
export const generateTestToken = (
  userId: string = 'test-user-id',
  role: string = 'user',
  expiresIn: string = '15m'
): string => {
  const payload = {
    id: userId,
    email: `${userId}@example.com`,
    name: 'Test User',
    role: role,
    exp: Math.floor(Date.now() / 1000) + (60 * 15) // 15 minutes expiration
  };
  
  const secret = process.env.JWT_SECRET || 'test-secret';
  return jwt.sign(payload, secret);
};

/**
 * Clean test data directories to ensure tests start with a clean slate
 */
async function cleanTestDataDirectories(): Promise<void> {
  const testDataDirs = [
    path.join(__dirname, '../../data/test/books'),
    path.join(__dirname, '../../data/test/reviews'),
    path.join(__dirname, '../../data/test/users'),
    path.join(__dirname, '../../data/test/indexes'),
  ];
  
  for (const dir of testDataDirs) {
    try {
      await fs.mkdir(dir, { recursive: true });
      const files = await fs.readdir(dir);
      
      for (const file of files) {
        if (file !== '.gitkeep') {
          await fs.unlink(path.join(dir, file));
        }
      }
    } catch (error) {
      console.error(`Error cleaning directory ${dir}:`, error);
    }
  }
}

/**
 * Seed test data for integration tests
 */
async function seedTestData(): Promise<void> {
  // Create test users
  await createTestUsers();
  
  // Create test books
  await createTestBooks();
  
  // Create test reviews
  await createTestReviews();
}

/**
 * Create test users for integration tests
 */
async function createTestUsers(): Promise<void> {
  const usersDir = path.join(__dirname, '../../data/test/users');
  
  const testUsers = [
    {
      id: 'test-admin-id',
      email: 'admin@example.com',
      name: 'Admin User',
      password: '$2b$10$Jw3SH6nF1wlBfJ9MCefFZeEw4Ck1L3qKbLOdpOr.DUu1QCCH88Qx2', // hashed 'admin123'
      role: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'test-user-id',
      email: 'user@example.com',
      name: 'Regular User',
      password: '$2b$10$Jw3SH6nF1wlBfJ9MCefFZeEw4Ck1L3qKbLOdpOr.DUu1QCCH88Qx2', // hashed 'password123'
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  
  for (const user of testUsers) {
    await fs.writeFile(
      path.join(usersDir, `${user.id}.json`),
      JSON.stringify(user, null, 2)
    );
  }
}

/**
 * Create test books for integration tests
 */
async function createTestBooks(): Promise<void> {
  const booksDir = path.join(__dirname, '../../data/test/books');
  
  const testBooks = [
    {
      id: 'test-book-1',
      title: 'Test Book 1',
      author: 'Test Author 1',
      description: 'Test description for book 1',
      coverImage: 'test-cover-1.jpg',
      genres: ['Fiction', 'Adventure'],
      averageRating: 4.5,
      totalReviews: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'test-book-2',
      title: 'Test Book 2',
      author: 'Test Author 2',
      description: 'Test description for book 2',
      coverImage: 'test-cover-2.jpg',
      genres: ['Non-fiction', 'Biography'],
      averageRating: 3.8,
      totalReviews: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  
  for (const book of testBooks) {
    await fs.writeFile(
      path.join(booksDir, `${book.id}.json`),
      JSON.stringify(book, null, 2)
    );
  }
}

/**
 * Create test reviews for integration tests
 */
async function createTestReviews(): Promise<void> {
  const reviewsDir = path.join(__dirname, '../../data/test/reviews');
  
  const testReviews = [
    {
      id: 'test-review-1',
      userId: 'test-user-id',
      bookId: 'test-book-1',
      rating: 5,
      text: 'Excellent book, highly recommended!',
      likes: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'test-review-2',
      userId: 'test-admin-id',
      bookId: 'test-book-1',
      rating: 4,
      text: 'Good book with interesting characters.',
      likes: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'test-review-3',
      userId: 'test-user-id',
      bookId: 'test-book-2',
      rating: 3.8,
      text: 'Decent book but could be better.',
      likes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  
  for (const review of testReviews) {
    await fs.writeFile(
      path.join(reviewsDir, `${review.id}.json`),
      JSON.stringify(review, null, 2)
    );
  }
}
