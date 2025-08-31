// src/types/services.d.ts

import { Request } from 'express';
import { Review, ReviewWithBookDetails } from '../services/reviewService';
import { Book } from '../services/bookService';
import { User } from '../services/userService';

// Define consistent interfaces for service access from controllers
export interface Services {
  book: BookService;
  review: ReviewService;
  user: UserService;
}

// Define the enhanced Express Request with typed services
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role?: string;
        userRoles?: string[];
      };
      app: {
        services: Services;
      };
    }
  }
}

// Define consistent service interfaces
export interface BookService {
  getBookById(bookId: string): Promise<Book | null>;
  searchBooks(
    query: string,
    page?: number,
    limit?: number,
    sortBy?: string,
    sortOrder?: string
  ): Promise<{ books: Book[]; total: number }>;
  getSuggestions(userId: string, limit?: number): Promise<Book[]>;
  updateAverageRating(bookId: string): Promise<void>;
}

export interface ReviewService {
  getReviewsByBookId(
    bookId: string,
    page?: number,
    limit?: number,
    sortBy?: string,
    sortOrder?: string
  ): Promise<{ reviews: Review[]; total: number }>;
  getReviewById(reviewId: string): Promise<Review | null>;
  createReview(review: Omit<Review, 'id' | 'createdAt' | 'updatedAt' | 'likes'>): Promise<Review>;
  updateReview(reviewId: string, update: Partial<Review>): Promise<Review | null>;
  deleteReview(reviewId: string): Promise<boolean>;
  getUserReviews(
    userId: string,
    sortBy?: string,
    sortOrder?: string,
    limit?: number,
    offset?: number
  ): Promise<ReviewWithBookDetails[]>;
  likeReview(reviewId: string, userId: string): Promise<Review | null>;
  unlikeReview(reviewId: string, userId: string): Promise<Review | null>;
}

export interface UserService {
  getUserById(userId: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  createUser(user: Omit<User, 'id'>): Promise<User>;
  updateUser(userId: string, update: Partial<User>): Promise<User | null>;
  validateCredentials(email: string, password: string): Promise<User | null>;
}
