// src/services/review/user-reviews.service.ts
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { Review } from '../../models/review/review.model';
import { BookSummary } from '../../models/book/book.model';
import { FileSystemError } from '../../utils/errors';

const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);

const REVIEWS_DIR = path.join(process.cwd(), 'data', 'reviews');
const BOOKS_DIR = path.join(process.cwd(), 'data', 'books');
const REVIEWS_BY_USER_DIR = path.join(process.cwd(), 'data', 'indexes', 'reviewsByUser');

// Interface for review with book details
export interface ReviewWithBookDetails extends Review {
  book: BookSummary;
}

// Parameters for pagination and sorting
export interface ReviewQueryParams {
  sortBy?: 'date' | 'rating';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

/**
 * Get reviews by a specific user with pagination and sorting
 * 
 * @param userId - ID of the user whose reviews to fetch
 * @param options - Query parameters for pagination and sorting
 * @returns Object containing reviews array and total count
 */
export const getReviewsByUser = async (
  userId: string,
  options: ReviewQueryParams = {}
): Promise<{ reviews: ReviewWithBookDetails[]; total: number }> => {
  try {
    // Set default options
    const {
      sortBy = 'date',
      sortOrder = 'desc',
      limit = 10,
      offset = 0
    } = options;
    
    // Try to get the index of reviews by this user
    let userReviewIds: string[] = [];
    const userIndexPath = path.join(REVIEWS_BY_USER_DIR, `${userId}.json`);
    
    try {
      const indexData = await readFile(userIndexPath, 'utf8');
      userReviewIds = JSON.parse(indexData);
    } catch (error) {
      // If the index doesn't exist, the user has no reviews
      return { reviews: [], total: 0 };
    }
    
    // Load all the user's reviews
    const reviewPromises = userReviewIds.map(async (reviewId) => {
      try {
        const reviewPath = path.join(REVIEWS_DIR, `${reviewId}.json`);
        const reviewData = await readFile(reviewPath, 'utf8');
        return JSON.parse(reviewData) as Review;
      } catch (error) {
        console.error(`Error loading review ${reviewId}:`, error);
        return null;
      }
    });
    
    const reviewsResults = await Promise.all(reviewPromises);
    const reviews = reviewsResults.filter(Boolean) as Review[];
    
    // Sort reviews
    reviews.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        return sortOrder === 'asc' ? a.rating - b.rating : b.rating - a.rating;
      }
    });
    
    // Get total count before pagination
    const total = reviews.length;
    
    // Apply pagination
    const paginatedReviews = reviews.slice(offset, offset + limit);
    
    // Load book details for each review
    const reviewsWithBooks: ReviewWithBookDetails[] = await Promise.all(
      paginatedReviews.map(async (review) => {
        try {
          const bookPath = path.join(BOOKS_DIR, `${review.bookId}.json`);
          const bookData = await readFile(bookPath, 'utf8');
          const book = JSON.parse(bookData);
          
          return {
            ...review,
            book: {
              id: book.id,
              title: book.title,
              author: book.author,
              coverImage: book.coverImage || undefined
            }
          };
        } catch (error) {
          console.error(`Error loading book details for review ${review.id}:`, error);
          
          // Return review with placeholder book info
          return {
            ...review,
            book: {
              id: review.bookId,
              title: 'Unknown Book',
              author: 'Unknown Author'
            }
          };
        }
      })
    );
    
    return {
      reviews: reviewsWithBooks,
      total
    };
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    throw new FileSystemError('Failed to fetch user reviews');
  }
};
