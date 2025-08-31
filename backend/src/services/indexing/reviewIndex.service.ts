/**
 * Review Index Service
 * 
 * Specialized indexing service for review entities.
 * Provides methods for indexing and looking up reviews based on various criteria.
 */
import path from 'path';
import { FileStorageManager } from '../storage/fileStorageManager';
import { LockManager } from '../storage/lockManager';
import { IndexService } from './index.service';
import { Review } from '../storage/entityStorage/reviewStorage.service';

export class ReviewIndexService {
  private userIndex: IndexService<Review>;
  private bookIndex: IndexService<Review>;
  private ratingIndex: IndexService<Review>;
  private dateIndex: IndexService<Review>;
  private indexDir: string;
  
  /**
   * Constructor
   * @param dataDir Base data directory
   * @param fileManager File storage manager
   * @param lockManager Lock manager
   */
  constructor(
    dataDir: string,
    private fileManager: FileStorageManager,
    private lockManager: LockManager
  ) {
    this.indexDir = path.resolve(dataDir, 'indexes', 'reviews');
    
    // Initialize indexes
    this.userIndex = new IndexService<Review>(this.indexDir, 'review-user', fileManager, lockManager);
    this.bookIndex = new IndexService<Review>(this.indexDir, 'review-book', fileManager, lockManager);
    this.ratingIndex = new IndexService<Review>(this.indexDir, 'review-rating', fileManager, lockManager);
    this.dateIndex = new IndexService<Review>(this.indexDir, 'review-date', fileManager, lockManager);
  }
  
  /**
   * Initialize all indexes
   */
  async initIndexes(): Promise<void> {
    try {
      // Ensure directory exists
      await this.fileManager.ensureDirectory(this.indexDir);
      
      // Initialize all indexes
      await Promise.all([
        this.userIndex.init(),
        this.bookIndex.init(),
        this.ratingIndex.init(),
        this.dateIndex.init()
      ]);
    } catch (error) {
      console.error(`Error initializing review indexes: ${error}`);
      throw new Error('Failed to initialize review indexes');
    }
  }
  
  /**
   * Index a review in all indexes
   * @param review Review to index
   */
  async indexReview(review: Review): Promise<void> {
    try {
      const promises = [];
      
      // Add to user index
      promises.push(this.userIndex.addOrUpdate(review.userId, review.id));
      
      // Add to book index
      promises.push(this.bookIndex.addOrUpdate(review.bookId, review.id));
      
      // Add to rating index
      promises.push(this.ratingIndex.addOrUpdate(review.rating.toString(), review.id));
      
      // Add to date index (by month)
      if (review.createdAt) {
        const date = new Date(review.createdAt);
        const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        promises.push(this.dateIndex.addOrUpdate(yearMonth, review.id));
      }
      
      await Promise.all(promises);
    } catch (error) {
      console.error(`Error indexing review ${review.id}: ${error}`);
      throw new Error(`Failed to index review ${review.id}`);
    }
  }
  
  /**
   * Remove review from all indexes
   * @param reviewId Review ID to remove
   */
  async removeReview(reviewId: string): Promise<void> {
    try {
      await Promise.all([
        this.userIndex.removeEntity(reviewId),
        this.bookIndex.removeEntity(reviewId),
        this.ratingIndex.removeEntity(reviewId),
        this.dateIndex.removeEntity(reviewId)
      ]);
    } catch (error) {
      console.error(`Error removing review ${reviewId} from indexes: ${error}`);
      throw new Error(`Failed to remove review ${reviewId} from indexes`);
    }
  }
  
  /**
   * Update review indexes
   * @param review Updated review
   */
  async updateReview(review: Review): Promise<void> {
    try {
      // Remove from all indexes first
      await this.removeReview(review.id);
      
      // Re-index
      await this.indexReview(review);
    } catch (error) {
      console.error(`Error updating review ${review.id} in indexes: ${error}`);
      throw new Error(`Failed to update review ${review.id} in indexes`);
    }
  }
  
  /**
   * Rebuild all review indexes from a collection of reviews
   * @param reviews Collection of reviews
   */
  async rebuildIndexes(reviews: Review[]): Promise<void> {
    try {
      // Rebuild user index
      await this.userIndex.rebuildIndex(
        reviews,
        (review: Review) => review.userId,
        (review: Review) => review.id
      );
      
      // Rebuild book index
      await this.bookIndex.rebuildIndex(
        reviews,
        (review: Review) => review.bookId,
        (review: Review) => review.id
      );
      
      // Rebuild rating index
      await this.ratingIndex.rebuildIndex(
        reviews,
        (review: Review) => review.rating.toString(),
        (review: Review) => review.id
      );
      
      // Rebuild date index
      await this.dateIndex.rebuildIndex(
        reviews,
        (review: Review) => {
          if (!review.createdAt) return '';
          const date = new Date(review.createdAt);
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        },
        (review: Review) => review.id
      );
    } catch (error) {
      console.error(`Error rebuilding review indexes: ${error}`);
      throw new Error('Failed to rebuild review indexes');
    }
  }
  
  /**
   * Find reviews by user
   * @param userId User ID
   * @returns Array of review IDs
   */
  async findByUser(userId: string): Promise<string[]> {
    try {
      return await this.userIndex.lookupExact(userId);
    } catch (error) {
      console.error(`Error finding reviews by user ${userId}: ${error}`);
      throw new Error(`Failed to find reviews by user ${userId}`);
    }
  }
  
  /**
   * Find reviews by book
   * @param bookId Book ID
   * @returns Array of review IDs
   */
  async findByBook(bookId: string): Promise<string[]> {
    try {
      return await this.bookIndex.lookupExact(bookId);
    } catch (error) {
      console.error(`Error finding reviews by book ${bookId}: ${error}`);
      throw new Error(`Failed to find reviews by book ${bookId}`);
    }
  }
  
  /**
   * Find reviews by rating
   * @param rating Rating value
   * @returns Array of review IDs
   */
  async findByRating(rating: number): Promise<string[]> {
    try {
      return await this.ratingIndex.lookupExact(rating.toString());
    } catch (error) {
      console.error(`Error finding reviews by rating ${rating}: ${error}`);
      throw new Error(`Failed to find reviews by rating ${rating}`);
    }
  }
  
  /**
   * Find reviews by rating range
   * @param minRating Minimum rating
   * @param maxRating Maximum rating
   * @returns Array of review IDs
   */
  async findByRatingRange(minRating = 1, maxRating = 5): Promise<string[]> {
    try {
      const reviewIds = new Set<string>();
      
      for (let rating = minRating; rating <= maxRating; rating++) {
        const ids = await this.findByRating(rating);
        ids.forEach(id => reviewIds.add(id));
      }
      
      return Array.from(reviewIds);
    } catch (error) {
      console.error(`Error finding reviews by rating range ${minRating}-${maxRating}: ${error}`);
      throw new Error(`Failed to find reviews by rating range ${minRating}-${maxRating}`);
    }
  }
  
  /**
   * Find reviews by date range
   * @param startDate Start date
   * @param endDate End date
   * @returns Array of review IDs
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<string[]> {
    try {
      // Get all date keys
      const dateKeys = await this.dateIndex.getAllKeys();
      
      // Filter by date range
      const startYearMonth = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
      const endYearMonth = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}`;
      
      const filteredKeys = dateKeys.filter(key => {
        return key >= startYearMonth && key <= endYearMonth;
      });
      
      // Get all matching review IDs
      const reviewIds = new Set<string>();
      
      for (const key of filteredKeys) {
        const ids = await this.dateIndex.lookupExact(key);
        ids.forEach(id => reviewIds.add(id));
      }
      
      return Array.from(reviewIds);
    } catch (error) {
      console.error(`Error finding reviews by date range: ${error}`);
      throw new Error('Failed to find reviews by date range');
    }
  }
  
  /**
   * Clear all index caches
   */
  clearCaches(): void {
    this.userIndex.clearCache();
    this.bookIndex.clearCache();
    this.ratingIndex.clearCache();
    this.dateIndex.clearCache();
  }
}
