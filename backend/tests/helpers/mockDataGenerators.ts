/**
 * Mock data generators for testing
 * Contains functions to generate mock data for users, books, reviews, and other entities
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a mock user with optional overrides
 */
export const generateMockUser = (overrides = {}) => {
  return {
    id: uuidv4(),
    email: `test-${Math.random().toString(36).substring(7)}@example.com`,
    name: `Test User ${Math.random().toString(36).substring(7)}`,
    password: 'Password123!',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    preferences: {
      favoriteGenres: ['fiction', 'mystery'],
      emailNotifications: true
    },
    ...overrides
  };
};

/**
 * Generate a mock book with optional overrides
 */
export const generateMockBook = (overrides = {}) => {
  return {
    id: uuidv4(),
    title: `Test Book ${Math.random().toString(36).substring(7)}`,
    author: `Test Author ${Math.random().toString(36).substring(7)}`,
    description: 'This is a test book description with enough length to be realistic.',
    coverImage: 'https://example.com/cover.jpg',
    genres: ['fiction', 'mystery'],
    publishedYear: 2023,
    averageRating: 4.5,
    reviewCount: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  };
};

/**
 * Generate a mock review with optional overrides
 */
export const generateMockReview = (overrides = {}) => {
  return {
    id: uuidv4(),
    bookId: uuidv4(),
    userId: uuidv4(),
    rating: 4,
    text: 'This is a test review with enough content to be realistic for testing purposes.',
    likes: 5,
    imageUrls: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  };
};

/**
 * Generate an array of mock items
 * @param generator - The generator function to use
 * @param count - The number of items to generate
 * @param baseOverrides - Overrides to apply to all generated items
 */
export const generateMockArray = <T>(
  generator: (overrides?: Record<string, any>) => T, 
  count: number, 
  baseOverrides: Record<string, any> = {}
): T[] => {
  return Array.from({ length: count }, (_, index) =>
    generator({
      ...baseOverrides,
      id: uuidv4(), // Ensure unique ID for each item
    })
  );
};
