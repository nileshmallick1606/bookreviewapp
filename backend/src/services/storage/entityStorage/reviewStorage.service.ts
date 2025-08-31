/**
 * Review Storage Service
 * 
 * Specialized storage service for review entities.
 * Extends the base storage service with review-specific validation and operations.
 */
import path from 'path';
import { BaseStorageService, BaseEntity } from '../baseStorage.service';
import { LockManager } from '../lockManager';
import { FileStorageManager } from '../fileStorageManager';

// Review entity interface
export interface Review extends BaseEntity {
  userId: string;
  bookId: string;
  rating: number;
  text: string;
  images?: string[];
  likes?: string[]; // Array of user IDs who liked the review
  comments?: ReviewComment[];
}

export interface ReviewComment {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
}

export class ReviewStorageService extends BaseStorageService<Review> {
  private lockManager: LockManager;
  private fileManager: FileStorageManager;
  private bookReviewIndexPath: string;
  private userReviewIndexPath: string;
  
  /**
   * Constructor
   * @param dataDir Directory for review data
   * @param lockManager Lock manager instance
   * @param fileManager File manager instance
   */
  constructor(
    dataDir: string,
    lockManager: LockManager,
    fileManager: FileStorageManager
  ) {
    super(dataDir);
    this.lockManager = lockManager;
    this.fileManager = fileManager;
    
    const indexesDir = path.resolve(path.dirname(dataDir), 'indexes');
    this.bookReviewIndexPath = path.resolve(indexesDir, 'book-review-index.json');
    this.userReviewIndexPath = path.resolve(indexesDir, 'user-review-index.json');
  }
  
  /**
   * Initialize storage with indexes
   */
  protected async initStorage(): Promise<void> {
    await super.initStorage();
    
    // Ensure indexes directory exists
    const indexesDir = path.dirname(this.bookReviewIndexPath);
    await this.fileManager.ensureDirectory(indexesDir);
    
    // Create indexes if they don't exist
    const indexPaths = [this.bookReviewIndexPath, this.userReviewIndexPath];
    
    for (const indexPath of indexPaths) {
      if (!(await this.fileManager.fileExists(indexPath))) {
        await this.fileManager.writeJsonFile(indexPath, {});
      }
    }
  }
  
  /**
   * Create a new review
   * @param reviewData Review data without ID
   * @returns Created review
   */
  async create(reviewData: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>): Promise<Review> {
    try {
      // Check if user already reviewed this book
      const existingReview = await this.findByUserAndBook(reviewData.userId, reviewData.bookId);
      
      if (existingReview) {
        throw new Error(`User ${reviewData.userId} already reviewed book ${reviewData.bookId}`);
      }
      
      // Create review
      const review = await super.create({
        ...reviewData,
        likes: reviewData.likes || [],
        comments: reviewData.comments || []
      });
      
      // Update indexes
      await this.updateBookReviewIndex(review.bookId, review.id);
      await this.updateUserReviewIndex(review.userId, review.id);
      
      return review;
    } catch (error) {
      console.error(`Error creating review: ${error}`);
      throw new Error(`Failed to create review: ${error}`);
    }
  }
  
  /**
   * Update review
   * @param id Review ID
   * @param updates Review data updates
   * @returns Updated review
   */
  async update(id: string, updates: Partial<Omit<Review, 'id' | 'createdAt'>>): Promise<Review> {
    // Acquire lock for review
    const lock = await this.lockManager.acquireLock(`review:${id}`);
    
    try {
      // Get current review
      const currentReview = await this.getById(id);
      if (!currentReview) {
        throw new Error(`Review with ID ${id} not found`);
      }
      
      // Check if bookId is being changed (should not be allowed in normal operation)
      if (updates.bookId && updates.bookId !== currentReview.bookId) {
        // Update book review index
        await this.updateBookReviewIndex(updates.bookId, id);
        await this.removeFromBookReviewIndex(currentReview.bookId, id);
      }
      
      // Check if userId is being changed (should not be allowed in normal operation)
      if (updates.userId && updates.userId !== currentReview.userId) {
        // Update user review index
        await this.updateUserReviewIndex(updates.userId, id);
        await this.removeFromUserReviewIndex(currentReview.userId, id);
      }
      
      // Update review
      const updatedReview = await super.update(id, updates);
      return updatedReview;
    } catch (error) {
      console.error(`Error updating review ${id}: ${error}`);
      throw new Error(`Failed to update review ${id}: ${error}`);
    } finally {
      // Release lock
      await this.lockManager.releaseLock(lock);
    }
  }
  
  /**
   * Delete review
   * @param id Review ID
   * @returns True if deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    // Acquire lock for review
    const lock = await this.lockManager.acquireLock(`review:${id}`);
    
    try {
      // Get review
      const review = await this.getById(id);
      if (!review) {
        return false;
      }
      
      // Remove from indexes
      await this.removeFromBookReviewIndex(review.bookId, id);
      await this.removeFromUserReviewIndex(review.userId, id);
      
      // Delete review
      return await super.delete(id);
    } catch (error) {
      console.error(`Error deleting review ${id}: ${error}`);
      throw new Error(`Failed to delete review ${id}`);
    } finally {
      // Release lock
      await this.lockManager.releaseLock(lock);
    }
  }
  
  /**
   * Find reviews by book ID
   * @param bookId Book ID
   * @returns Array of reviews for the book
   */
  async findByBook(bookId: string): Promise<Review[]> {
    try {
      await this.initStorage();
      
      // Get book review index
      const bookReviewIndex = await this.getBookReviewIndex();
      const reviewIds = bookReviewIndex[bookId] || [];
      
      // Get reviews by IDs
      const reviews: Review[] = [];
      for (const reviewId of reviewIds) {
        const review = await this.getById(reviewId);
        if (review) {
          reviews.push(review);
        }
      }
      
      return reviews;
    } catch (error) {
      console.error(`Error finding reviews for book ${bookId}: ${error}`);
      throw new Error(`Failed to find reviews for book ${bookId}`);
    }
  }
  
  /**
   * Find reviews by user ID
   * @param userId User ID
   * @returns Array of reviews by the user
   */
  async findByUser(userId: string): Promise<Review[]> {
    try {
      await this.initStorage();
      
      // Get user review index
      const userReviewIndex = await this.getUserReviewIndex();
      const reviewIds = userReviewIndex[userId] || [];
      
      // Get reviews by IDs
      const reviews: Review[] = [];
      for (const reviewId of reviewIds) {
        const review = await this.getById(reviewId);
        if (review) {
          reviews.push(review);
        }
      }
      
      return reviews;
    } catch (error) {
      console.error(`Error finding reviews by user ${userId}: ${error}`);
      throw new Error(`Failed to find reviews by user ${userId}`);
    }
  }
  
  /**
   * Find review by user ID and book ID
   * @param userId User ID
   * @param bookId Book ID
   * @returns Review or null if not found
   */
  async findByUserAndBook(userId: string, bookId: string): Promise<Review | null> {
    try {
      await this.initStorage();
      
      // Get user reviews
      const userReviews = await this.findByUser(userId);
      
      // Find review for the specific book
      return userReviews.find(review => review.bookId === bookId) || null;
    } catch (error) {
      console.error(`Error finding review by user ${userId} and book ${bookId}: ${error}`);
      throw new Error(`Failed to find review by user ${userId} and book ${bookId}`);
    }
  }
  
  /**
   * Add a like to a review
   * @param reviewId Review ID
   * @param userId User ID who likes the review
   * @returns Updated review
   */
  async addLike(reviewId: string, userId: string): Promise<Review> {
    // Acquire lock for review
    const lock = await this.lockManager.acquireLock(`review:${reviewId}`);
    
    try {
      // Get review
      const review = await this.getById(reviewId);
      if (!review) {
        throw new Error(`Review with ID ${reviewId} not found`);
      }
      
      // Check if user already liked the review
      const likes = review.likes || [];
      if (likes.includes(userId)) {
        return review; // Already liked
      }
      
      // Add like
      likes.push(userId);
      
      // Update review
      return await this.update(reviewId, { likes });
    } catch (error) {
      console.error(`Error adding like to review ${reviewId}: ${error}`);
      throw new Error(`Failed to add like to review ${reviewId}`);
    } finally {
      // Release lock
      await this.lockManager.releaseLock(lock);
    }
  }
  
  /**
   * Remove a like from a review
   * @param reviewId Review ID
   * @param userId User ID who unlikes the review
   * @returns Updated review
   */
  async removeLike(reviewId: string, userId: string): Promise<Review> {
    // Acquire lock for review
    const lock = await this.lockManager.acquireLock(`review:${reviewId}`);
    
    try {
      // Get review
      const review = await this.getById(reviewId);
      if (!review) {
        throw new Error(`Review with ID ${reviewId} not found`);
      }
      
      // Check if user liked the review
      if (!review.likes?.includes(userId)) {
        return review; // Not liked
      }
      
      // Remove like
      const likes = review.likes?.filter(id => id !== userId) || [];
      
      // Update review
      return await this.update(reviewId, { likes });
    } catch (error) {
      console.error(`Error removing like from review ${reviewId}: ${error}`);
      throw new Error(`Failed to remove like from review ${reviewId}`);
    } finally {
      // Release lock
      await this.lockManager.releaseLock(lock);
    }
  }
  
  /**
   * Add a comment to a review
   * @param reviewId Review ID
   * @param userId User ID who comments
   * @param text Comment text
   * @returns Updated review
   */
  async addComment(reviewId: string, userId: string, text: string): Promise<Review> {
    // Acquire lock for review
    const lock = await this.lockManager.acquireLock(`review:${reviewId}`);
    
    try {
      // Get review
      const review = await this.getById(reviewId);
      if (!review) {
        throw new Error(`Review with ID ${reviewId} not found`);
      }
      
      // Create comment
      const comment: ReviewComment = {
        id: Math.random().toString(36).substring(2, 15),
        userId,
        text,
        createdAt: new Date().toISOString()
      };
      
      // Add comment to review
      const comments = [...(review.comments || []), comment];
      
      // Update review
      return await this.update(reviewId, { comments });
    } catch (error) {
      console.error(`Error adding comment to review ${reviewId}: ${error}`);
      throw new Error(`Failed to add comment to review ${reviewId}`);
    } finally {
      // Release lock
      await this.lockManager.releaseLock(lock);
    }
  }
  
  /**
   * Remove a comment from a review
   * @param reviewId Review ID
   * @param commentId Comment ID
   * @returns Updated review
   */
  async removeComment(reviewId: string, commentId: string): Promise<Review> {
    // Acquire lock for review
    const lock = await this.lockManager.acquireLock(`review:${reviewId}`);
    
    try {
      // Get review
      const review = await this.getById(reviewId);
      if (!review) {
        throw new Error(`Review with ID ${reviewId} not found`);
      }
      
      // Check if comment exists
      if (!review.comments?.some(comment => comment.id === commentId)) {
        return review; // Comment not found
      }
      
      // Remove comment
      const comments = review.comments?.filter(comment => comment.id !== commentId) || [];
      
      // Update review
      return await this.update(reviewId, { comments });
    } catch (error) {
      console.error(`Error removing comment from review ${reviewId}: ${error}`);
      throw new Error(`Failed to remove comment from review ${reviewId}`);
    } finally {
      // Release lock
      await this.lockManager.releaseLock(lock);
    }
  }
  
  /**
   * Update book review index
   * @param bookId Book ID
   * @param reviewId Review ID
   */
  private async updateBookReviewIndex(bookId: string, reviewId: string): Promise<void> {
    // Acquire lock for book review index
    const lock = await this.lockManager.acquireLock('book-review-index');
    
    try {
      const bookReviewIndex = await this.getBookReviewIndex();
      
      if (!bookReviewIndex[bookId]) {
        bookReviewIndex[bookId] = [];
      }
      
      if (!bookReviewIndex[bookId].includes(reviewId)) {
        bookReviewIndex[bookId].push(reviewId);
      }
      
      await this.fileManager.writeJsonFile(this.bookReviewIndexPath, bookReviewIndex);
    } catch (error) {
      console.error(`Error updating book review index: ${error}`);
      throw new Error('Failed to update book review index');
    } finally {
      // Release lock
      await this.lockManager.releaseLock(lock);
    }
  }
  
  /**
   * Remove review from book review index
   * @param bookId Book ID
   * @param reviewId Review ID
   */
  private async removeFromBookReviewIndex(bookId: string, reviewId: string): Promise<void> {
    // Acquire lock for book review index
    const lock = await this.lockManager.acquireLock('book-review-index');
    
    try {
      const bookReviewIndex = await this.getBookReviewIndex();
      
      if (bookReviewIndex[bookId]) {
        bookReviewIndex[bookId] = bookReviewIndex[bookId].filter(id => id !== reviewId);
        
        if (bookReviewIndex[bookId].length === 0) {
          delete bookReviewIndex[bookId];
        }
      }
      
      await this.fileManager.writeJsonFile(this.bookReviewIndexPath, bookReviewIndex);
    } catch (error) {
      console.error(`Error removing from book review index: ${error}`);
      throw new Error('Failed to remove from book review index');
    } finally {
      // Release lock
      await this.lockManager.releaseLock(lock);
    }
  }
  
  /**
   * Update user review index
   * @param userId User ID
   * @param reviewId Review ID
   */
  private async updateUserReviewIndex(userId: string, reviewId: string): Promise<void> {
    // Acquire lock for user review index
    const lock = await this.lockManager.acquireLock('user-review-index');
    
    try {
      const userReviewIndex = await this.getUserReviewIndex();
      
      if (!userReviewIndex[userId]) {
        userReviewIndex[userId] = [];
      }
      
      if (!userReviewIndex[userId].includes(reviewId)) {
        userReviewIndex[userId].push(reviewId);
      }
      
      await this.fileManager.writeJsonFile(this.userReviewIndexPath, userReviewIndex);
    } catch (error) {
      console.error(`Error updating user review index: ${error}`);
      throw new Error('Failed to update user review index');
    } finally {
      // Release lock
      await this.lockManager.releaseLock(lock);
    }
  }
  
  /**
   * Remove review from user review index
   * @param userId User ID
   * @param reviewId Review ID
   */
  private async removeFromUserReviewIndex(userId: string, reviewId: string): Promise<void> {
    // Acquire lock for user review index
    const lock = await this.lockManager.acquireLock('user-review-index');
    
    try {
      const userReviewIndex = await this.getUserReviewIndex();
      
      if (userReviewIndex[userId]) {
        userReviewIndex[userId] = userReviewIndex[userId].filter(id => id !== reviewId);
        
        if (userReviewIndex[userId].length === 0) {
          delete userReviewIndex[userId];
        }
      }
      
      await this.fileManager.writeJsonFile(this.userReviewIndexPath, userReviewIndex);
    } catch (error) {
      console.error(`Error removing from user review index: ${error}`);
      throw new Error('Failed to remove from user review index');
    } finally {
      // Release lock
      await this.lockManager.releaseLock(lock);
    }
  }
  
  /**
   * Get book review index
   * @returns Book ID to review IDs mapping
   */
  private async getBookReviewIndex(): Promise<Record<string, string[]>> {
    try {
      const data = await this.fileManager.readJsonFile<Record<string, string[]>>(this.bookReviewIndexPath);
      return data || {};
    } catch (error) {
      console.error(`Error getting book review index: ${error}`);
      return {};
    }
  }
  
  /**
   * Get user review index
   * @returns User ID to review IDs mapping
   */
  private async getUserReviewIndex(): Promise<Record<string, string[]>> {
    try {
      const data = await this.fileManager.readJsonFile<Record<string, string[]>>(this.userReviewIndexPath);
      return data || {};
    } catch (error) {
      console.error(`Error getting user review index: ${error}`);
      return {};
    }
  }
  
  /**
   * Validate review entity
   * @param review Review to validate
   */
  protected async validateEntity(review: Review): Promise<void> {
    // Validate required fields
    if (!review.userId) {
      throw new Error('Review user ID is required');
    }
    
    if (!review.bookId) {
      throw new Error('Review book ID is required');
    }
    
    if (typeof review.rating !== 'number' || review.rating < 1 || review.rating > 5) {
      throw new Error('Review rating must be a number between 1 and 5');
    }
    
    if (!review.text) {
      throw new Error('Review text is required');
    }
    
    // Validate text length
    if (review.text.length > 5000) {
      throw new Error('Review text cannot exceed 5000 characters');
    }
  }
}
