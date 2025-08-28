// src/services/reviewService.ts
import fs from 'fs/promises';
import path from 'path';

// Constants for file paths
const REVIEW_DATA_DIR = path.resolve(__dirname, '../../data/reviews');
const BOOK_DATA_DIR = path.resolve(__dirname, '../../data/books');

// Ensure directories exist
const initStorage = async (): Promise<void> => {
  try {
    await fs.mkdir(REVIEW_DATA_DIR, { recursive: true });
  } catch (error) {
    console.error('Error initializing review storage:', error);
    throw new Error('Failed to initialize review storage');
  }
};

export interface Review {
  id: string;
  userId: string;
  bookId: string;
  rating: number;
  text: string;
  images?: string[];
  likes: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewWithBookDetails extends Review {
  book: {
    id: string;
    title: string;
    author: string;
    coverImage?: string;
  };
}

/**
 * Get all reviews by a specific user
 * @param userId User ID
 * @param sortBy Field to sort by ('date' or 'rating')
 * @param sortOrder Sort order ('asc' or 'desc')
 * @param limit Maximum number of reviews to return
 * @param offset Number of reviews to skip
 * @returns Array of reviews with book details
 */
export const getUserReviews = async (
  userId: string,
  sortBy: 'date' | 'rating' = 'date',
  sortOrder: 'asc' | 'desc' = 'desc',
  limit: number = 10,
  offset: number = 0
): Promise<{
  reviews: ReviewWithBookDetails[];
  total: number;
}> => {
  try {
    await initStorage();
    
    // Read all review files
    const files = await fs.readdir(REVIEW_DATA_DIR);
    
    // Filter and parse reviews by user ID
    const userReviews: Review[] = [];
    
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      
      try {
        const data = await fs.readFile(path.join(REVIEW_DATA_DIR, file), 'utf-8');
        const review = JSON.parse(data);
        
        if (review.userId === userId) {
          userReviews.push(review);
        }
      } catch (error) {
        console.error(`Error reading review file ${file}:`, error);
      }
    }
    
    // Sort reviews
    userReviews.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        return sortOrder === 'asc' ? a.rating - b.rating : b.rating - a.rating;
      }
    });
    
    // Get total count before pagination
    const total = userReviews.length;
    
    // Apply pagination
    const paginatedReviews = userReviews.slice(offset, offset + limit);
    
    // Get book details for each review
    const reviewsWithBookDetails: ReviewWithBookDetails[] = await Promise.all(
      paginatedReviews.map(async (review) => {
        try {
          const bookFilePath = path.join(BOOK_DATA_DIR, `${review.bookId}.json`);
          const bookData = await fs.readFile(bookFilePath, 'utf-8');
          const book = JSON.parse(bookData);
          
          return {
            ...review,
            book: {
              id: book.id,
              title: book.title,
              author: book.author,
              coverImage: book.coverImage
            }
          };
        } catch (error) {
          console.error(`Error reading book data for review ${review.id}:`, error);
          
          // Return review with placeholder book info
          return {
            ...review,
            book: {
              id: review.bookId,
              title: 'Unknown Book',
              author: 'Unknown Author',
              coverImage: undefined
            }
          };
        }
      })
    );
    
    return {
      reviews: reviewsWithBookDetails,
      total
    };
  } catch (error) {
    console.error('Error getting user reviews:', error);
    throw new Error('Failed to get user reviews');
  }
};
