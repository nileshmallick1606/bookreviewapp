/**
 * Test fixtures for unit tests
 * Contains common data structures for testing
 */

/**
 * Standard user fixtures for testing user-related functionality
 */
export const userFixtures = {
  validUser: {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'user@example.com',
    name: 'Test User',
    password: '$2a$10$Xz.cY5JDy6CG/DkzRnxn2efKAY.rFEbpjMEt5qQ8YnO8IjK4jCyYy', // hashed 'Password123!'
    createdAt: '2025-08-15T10:30:00.000Z',
    updatedAt: '2025-08-15T10:30:00.000Z',
    preferences: {
      favoriteGenres: ['fiction', 'mystery'],
      emailNotifications: true
    }
  },
  adminUser: {
    id: '223e4567-e89b-12d3-a456-426614174001',
    email: 'admin@example.com',
    name: 'Admin User',
    password: '$2a$10$Xz.cY5JDy6CG/DkzRnxn2efKAY.rFEbpjMEt5qQ8YnO8IjK4jCyYy', // hashed 'Password123!'
    role: 'admin',
    createdAt: '2025-08-15T10:30:00.000Z',
    updatedAt: '2025-08-15T10:30:00.000Z',
    preferences: {
      favoriteGenres: ['non-fiction', 'biography'],
      emailNotifications: false
    }
  },
  newUser: {
    email: 'newuser@example.com',
    name: 'New User',
    password: 'Password123!',
    preferences: {
      favoriteGenres: ['science-fiction', 'fantasy'],
      emailNotifications: true
    }
  }
};

/**
 * Standard book fixtures for testing book-related functionality
 */
export const bookFixtures = {
  validBook: {
    id: '323e4567-e89b-12d3-a456-426614174002',
    title: 'Test Book',
    author: 'Test Author',
    description: 'This is a test book description that is long enough to be realistic.',
    coverImage: 'https://example.com/cover.jpg',
    genres: ['fiction', 'mystery'],
    publishedYear: 2023,
    averageRating: 4.5,
    reviewCount: 10,
    createdAt: '2025-08-15T10:30:00.000Z',
    updatedAt: '2025-08-15T10:30:00.000Z'
  },
  newBook: {
    title: 'New Test Book',
    author: 'New Test Author',
    description: 'This is a description for a new book being created in tests.',
    coverImage: 'https://example.com/new-cover.jpg',
    genres: ['science-fiction', 'fantasy'],
    publishedYear: 2025
  }
};

/**
 * Standard review fixtures for testing review-related functionality
 */
export const reviewFixtures = {
  validReview: {
    id: '423e4567-e89b-12d3-a456-426614174003',
    bookId: '323e4567-e89b-12d3-a456-426614174002',
    userId: '123e4567-e89b-12d3-a456-426614174000',
    rating: 4,
    text: 'This is a test review with enough content to be realistic for testing purposes.',
    likes: 5,
    imageUrls: [],
    createdAt: '2025-08-15T10:30:00.000Z',
    updatedAt: '2025-08-15T10:30:00.000Z'
  },
  newReview: {
    bookId: '323e4567-e89b-12d3-a456-426614174002',
    userId: '123e4567-e89b-12d3-a456-426614174000',
    rating: 5,
    text: 'This is a new test review being created in tests.',
    imageUrls: ['https://example.com/review-image.jpg']
  }
};

/**
 * Authentication fixtures
 */
export const authFixtures = {
  validToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyM2U0NTY3LWU4OWItMTJkMy1hNDU2LTQyNjYxNDE3NDAwMCIsImlhdCI6MTU5MzUxNTYwMCwiZXhwIjoxNTkzNTU4ODAwfQ.signature',
  refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyM2U0NTY3LWU4OWItMTJkMy1hNDU2LTQyNjYxNDE3NDAwMCIsImlhdCI6MTU5MzUxNTYwMCwiZXhwIjoxNTk0MTIwNDAwfQ.signature',
  loginCredentials: {
    email: 'user@example.com',
    password: 'Password123!'
  }
};
