import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { Review, ReviewCreationParams, ReviewUpdateParams, createReview, ReviewComment } from '../../models/review/review.model';
import { calculateAverageRating } from '../book/book.service';
import { FileSystemError, NotFoundError, AuthorizationError } from '../../utils/errors';
import { fileExists } from '../../utils/file';
import { v4 as uuidv4 } from 'uuid';

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);

const REVIEWS_DIR = path.join(process.cwd(), 'data', 'reviews');
const REVIEWS_BY_BOOK_DIR = path.join(process.cwd(), 'data', 'indexes', 'reviewsByBook');
const REVIEWS_BY_USER_DIR = path.join(process.cwd(), 'data', 'indexes', 'reviewsByUser');

// Ensure directories exist
const ensureDirectoriesExist = async (): Promise<void> => {
  try {
    await mkdir(REVIEWS_DIR, { recursive: true });
    await mkdir(REVIEWS_BY_BOOK_DIR, { recursive: true });
    await mkdir(REVIEWS_BY_USER_DIR, { recursive: true });
  } catch (error) {
    throw new FileSystemError('Failed to create review directories');
  }
};

// Create a new review
export const createNewReview = async (params: ReviewCreationParams): Promise<Review> => {
  await ensureDirectoriesExist();
  
  // We no longer check if user already reviewed this book
  // This allows multiple reviews per user for each book
  
  // Create new review
  const review = createReview(params);
  const reviewPath = path.join(REVIEWS_DIR, `${review.id}.json`);
  
  try {
    // Save review file
    await writeFile(reviewPath, JSON.stringify(review, null, 2));
    
    // Update book-reviews index
    await updateBookReviewIndex(review.bookId, review.id);
    
    // Update user-reviews index
    await updateUserReviewIndex(review.userId, review.id);
    
    // Recalculate book rating
    await calculateAverageRating(review.bookId);
    
    return review;
  } catch (error) {
    throw new FileSystemError('Failed to save review');
  }
};

// Get review by ID
export const getReviewById = async (reviewId: string): Promise<Review | null> => {
  const reviewPath = path.join(REVIEWS_DIR, `${reviewId}.json`);
  
  if (!(await fileExists(reviewPath))) {
    return null;
  }
  
  try {
    const reviewData = await readFile(reviewPath, 'utf-8');
    return JSON.parse(reviewData) as Review;
  } catch (error) {
    throw new FileSystemError('Failed to read review');
  }
};

// Get reviews by book ID
export const getReviewsByBook = async (bookId: string): Promise<Review[]> => {
  const bookIndexPath = path.join(REVIEWS_BY_BOOK_DIR, `${bookId}.json`);
  
  try {
    // Check if the index file exists
    if (!(await fileExists(bookIndexPath))) {
      console.log(`No reviews index found for book ID: ${bookId}`);
      return [];
    }
    
    const indexData = await readFile(bookIndexPath, 'utf-8');
    const reviewIds = JSON.parse(indexData) as string[];
    console.log(`Found ${reviewIds.length} reviews for book ID: ${bookId}`);
    
    const reviews = await Promise.all(
      reviewIds.map(async id => {
        try {
          const review = await getReviewById(id);
          return review;
        } catch (err) {
          console.error(`Error fetching review ID ${id}:`, err);
          return null;
        }
      })
    );
    
    return reviews.filter(Boolean) as Review[];
  } catch (error) {
    console.error(`Error in getReviewsByBook for ${bookId}:`, error);
    throw new FileSystemError('Failed to get reviews by book');
  }
};

// Get reviews by user ID
export const getReviewsByUser = async (userId: string): Promise<Review[]> => {
  const userIndexPath = path.join(REVIEWS_BY_USER_DIR, `${userId}.json`);
  
  if (!(await fileExists(userIndexPath))) {
    return [];
  }
  
  try {
    const indexData = await readFile(userIndexPath, 'utf-8');
    const reviewIds = JSON.parse(indexData) as string[];
    
    const reviews = await Promise.all(
      reviewIds.map(async id => {
        const review = await getReviewById(id);
        return review;
      })
    );
    
    return reviews.filter(Boolean) as Review[];
  } catch (error) {
    throw new FileSystemError('Failed to get reviews by user');
  }
};

// Update an existing review
export const updateReviewById = async (reviewId: string, params: ReviewUpdateParams): Promise<Review> => {
  const reviewPath = path.join(REVIEWS_DIR, `${reviewId}.json`);
  
  if (!(await fileExists(reviewPath))) {
    throw new NotFoundError(`Review not found: ${reviewId}`);
  }
  
  try {
    // Read current review
    const reviewData = await readFile(reviewPath, 'utf-8');
    const review = JSON.parse(reviewData) as Review;
    
    // Update fields
    const updatedReview = {
      ...review,
      rating: params.rating !== undefined ? params.rating : review.rating,
      text: params.text !== undefined ? params.text : review.text,
      imageUrls: params.imageUrls !== undefined ? params.imageUrls : review.imageUrls,
      updatedAt: new Date().toISOString()
    };
    
    // Write updated review back to file
    await writeFile(reviewPath, JSON.stringify(updatedReview, null, 2));
    
    // Recalculate book rating if the rating changed
    if (params.rating !== undefined && params.rating !== review.rating) {
      try {
        await calculateAverageRating(updatedReview.bookId);
      } catch (ratingError) {
        console.error(`Error recalculating rating for book ${updatedReview.bookId}:`, ratingError);
        // Continue despite rating calculation error
      }
    }
    
    return updatedReview;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new FileSystemError('Failed to update review');
  }
};

// Delete a review
export const deleteReviewById = async (reviewId: string): Promise<void> => {
  const reviewPath = path.join(REVIEWS_DIR, `${reviewId}.json`);
  
  if (!(await fileExists(reviewPath))) {
    throw new NotFoundError(`Review not found: ${reviewId}`);
  }
  
  try {
    // Get review data before deletion
    const reviewData = await readFile(reviewPath, 'utf-8');
    const review = JSON.parse(reviewData) as Review;
    
    // Delete review file
    await unlink(reviewPath);
    
    // Remove from book index
    await removeFromBookReviewIndex(review.bookId, reviewId);
    
    // Remove from user index
    await removeFromUserReviewIndex(review.userId, reviewId);
    
    // Recalculate book rating after review deletion
    try {
      await calculateAverageRating(review.bookId);
    } catch (ratingError) {
      console.error(`Error recalculating rating for book ${review.bookId} after review deletion:`, ratingError);
      // Continue despite rating calculation error
    }
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new FileSystemError('Failed to delete review');
  }
};

// Toggle like on a review
export const toggleReviewLike = async (reviewId: string, userId: string): Promise<Review> => {
  const reviewPath = path.join(REVIEWS_DIR, `${reviewId}.json`);
  
  if (!(await fileExists(reviewPath))) {
    throw new NotFoundError(`Review not found: ${reviewId}`);
  }
  
  try {
    // Read current review
    const reviewData = await readFile(reviewPath, 'utf-8');
    const review = JSON.parse(reviewData) as Review;
    
    // Check if user already liked
    const userLiked = review.likes.includes(userId);
    
    // Toggle like
    let updatedLikes: string[];
    if (userLiked) {
      // Unlike
      updatedLikes = review.likes.filter(id => id !== userId);
    } else {
      // Like
      updatedLikes = [...review.likes, userId];
    }
    
    // Update review
    const updatedReview = {
      ...review,
      likes: updatedLikes
    };
    
    // Write updated review back to file
    await writeFile(reviewPath, JSON.stringify(updatedReview, null, 2));
    
    return updatedReview;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new FileSystemError('Failed to toggle like');
  }
};

// Add comment to review
export const addCommentToReview = async (reviewId: string, userId: string, text: string): Promise<Review> => {
  const reviewPath = path.join(REVIEWS_DIR, `${reviewId}.json`);
  
  if (!(await fileExists(reviewPath))) {
    throw new NotFoundError(`Review not found: ${reviewId}`);
  }
  
  try {
    // Read current review
    const reviewData = await readFile(reviewPath, 'utf-8');
    const review = JSON.parse(reviewData) as Review;
    
    // Create new comment
    const newComment: ReviewComment = {
      id: uuidv4(),
      userId,
      text,
      createdAt: new Date().toISOString()
    };
    
    // Add comment to review
    const updatedReview = {
      ...review,
      comments: [...review.comments, newComment]
    };
    
    // Write updated review back to file
    await writeFile(reviewPath, JSON.stringify(updatedReview, null, 2));
    
    return updatedReview;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new FileSystemError('Failed to add comment');
  }
};

// Update book review index
const updateBookReviewIndex = async (bookId: string, reviewId: string): Promise<void> => {
  const bookIndexPath = path.join(REVIEWS_BY_BOOK_DIR, `${bookId}.json`);
  let reviewIds: string[] = [];
  
  if (await fileExists(bookIndexPath)) {
    try {
      const indexData = await readFile(bookIndexPath, 'utf-8');
      reviewIds = JSON.parse(indexData);
    } catch (error) {
      throw new FileSystemError('Failed to read book review index');
    }
  }
  
  if (!reviewIds.includes(reviewId)) {
    reviewIds.push(reviewId);
  }
  
  try {
    await writeFile(bookIndexPath, JSON.stringify(reviewIds));
  } catch (error) {
    throw new FileSystemError('Failed to update book review index');
  }
};

// Remove from book review index
const removeFromBookReviewIndex = async (bookId: string, reviewId: string): Promise<void> => {
  const bookIndexPath = path.join(REVIEWS_BY_BOOK_DIR, `${bookId}.json`);
  
  if (!(await fileExists(bookIndexPath))) {
    return;
  }
  
  try {
    const indexData = await readFile(bookIndexPath, 'utf-8');
    let reviewIds = JSON.parse(indexData) as string[];
    
    // Filter out the deleted review ID
    reviewIds = reviewIds.filter(id => id !== reviewId);
    
    await writeFile(bookIndexPath, JSON.stringify(reviewIds));
  } catch (error) {
    throw new FileSystemError('Failed to update book review index');
  }
};

// Update user review index
const updateUserReviewIndex = async (userId: string, reviewId: string): Promise<void> => {
  const userIndexPath = path.join(REVIEWS_BY_USER_DIR, `${userId}.json`);
  let reviewIds: string[] = [];
  
  if (await fileExists(userIndexPath)) {
    try {
      const indexData = await readFile(userIndexPath, 'utf-8');
      reviewIds = JSON.parse(indexData);
    } catch (error) {
      throw new FileSystemError('Failed to read user review index');
    }
  }
  
  if (!reviewIds.includes(reviewId)) {
    reviewIds.push(reviewId);
  }
  
  try {
    await writeFile(userIndexPath, JSON.stringify(reviewIds));
  } catch (error) {
    throw new FileSystemError('Failed to update user review index');
  }
};

// Remove from user review index
const removeFromUserReviewIndex = async (userId: string, reviewId: string): Promise<void> => {
  const userIndexPath = path.join(REVIEWS_BY_USER_DIR, `${userId}.json`);
  
  if (!(await fileExists(userIndexPath))) {
    return;
  }
  
  try {
    const indexData = await readFile(userIndexPath, 'utf-8');
    let reviewIds = JSON.parse(indexData) as string[];
    
    // Filter out the deleted review ID
    reviewIds = reviewIds.filter(id => id !== reviewId);
    
    await writeFile(userIndexPath, JSON.stringify(reviewIds));
  } catch (error) {
    throw new FileSystemError('Failed to update user review index');
  }
};
