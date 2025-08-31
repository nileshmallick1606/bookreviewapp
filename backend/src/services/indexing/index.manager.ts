/**
 * Index Manager Service
 * 
 * Coordinates and manages all indexing operations for the application.
 * Acts as a facade for the various entity-specific index services.
 */
import path from 'path';
import { FileStorageManager } from '../storage/fileStorageManager';
import { LockManager } from '../storage/lockManager';
import { BookIndexService } from './bookIndex.service';
import { UserIndexService } from './userIndex.service';
import { ReviewIndexService } from './reviewIndex.service';
import { Book } from '../storage/entityStorage/bookStorage.service';
import { User } from '../storage/entityStorage/userStorage.service';
import { Review } from '../storage/entityStorage/reviewStorage.service';

export class IndexManager {
  private bookIndexService: BookIndexService;
  private userIndexService: UserIndexService;
  private reviewIndexService: ReviewIndexService;
  
  /**
   * Constructor
   * @param dataDir Base data directory
   */
  constructor(dataDir: string) {
    // Create file manager and lock manager
    const fileManager = new FileStorageManager();
    const lockManager = new LockManager(path.join(dataDir, 'locks'));
    
    // Create index services
    this.bookIndexService = new BookIndexService(dataDir, fileManager, lockManager);
    this.userIndexService = new UserIndexService(dataDir, fileManager, lockManager);
    this.reviewIndexService = new ReviewIndexService(dataDir, fileManager, lockManager);
  }
  
  /**
   * Initialize all indexes
   */
  async initIndexes(): Promise<void> {
    try {
      await Promise.all([
        this.bookIndexService.initIndexes(),
        this.userIndexService.initIndexes(),
        this.reviewIndexService.initIndexes()
      ]);
    } catch (error) {
      console.error(`Error initializing indexes: ${error}`);
      throw new Error('Failed to initialize indexes');
    }
  }
  
  // Book indexing operations
  
  /**
   * Index a book
   * @param book Book to index
   */
  async indexBook(book: Book): Promise<void> {
    return this.bookIndexService.indexBook(book);
  }
  
  /**
   * Remove book from indexes
   * @param bookId Book ID to remove
   */
  async removeBookIndex(bookId: string): Promise<void> {
    return this.bookIndexService.removeBook(bookId);
  }
  
  /**
   * Update book indexes
   * @param book Updated book
   */
  async updateBookIndex(book: Book): Promise<void> {
    return this.bookIndexService.updateBook(book);
  }
  
  /**
   * Rebuild book indexes
   * @param books Collection of books
   */
  async rebuildBookIndexes(books: Book[]): Promise<void> {
    return this.bookIndexService.rebuildIndexes(books);
  }
  
  // Book lookup operations
  
  /**
   * Find books by title
   * @param title Book title or part of title
   * @param exactMatch Whether to find exact matches only
   */
  async findBooksByTitle(title: string, exactMatch = false): Promise<string[]> {
    return this.bookIndexService.findByTitle(title, exactMatch);
  }
  
  /**
   * Find books by author
   * @param author Author name or part of name
   * @param exactMatch Whether to find exact matches only
   */
  async findBooksByAuthor(author: string, exactMatch = false): Promise<string[]> {
    return this.bookIndexService.findByAuthor(author, exactMatch);
  }
  
  /**
   * Find books by genre
   * @param genre Genre to search for
   */
  async findBooksByGenre(genre: string): Promise<string[]> {
    return this.bookIndexService.findByGenre(genre);
  }
  
  /**
   * Find books by year
   * @param year Published year
   */
  async findBooksByYear(year: number): Promise<string[]> {
    return this.bookIndexService.findByYear(year);
  }
  
  /**
   * Find books by rating range
   * @param minRating Minimum rating
   * @param maxRating Maximum rating
   */
  async findBooksByRatingRange(minRating = 0, maxRating = 5): Promise<string[]> {
    return this.bookIndexService.findByRatingRange(minRating, maxRating);
  }
  
  /**
   * Get all genres
   */
  async getAllGenres(): Promise<string[]> {
    return this.bookIndexService.getAllGenres();
  }
  
  // User indexing operations
  
  /**
   * Index a user
   * @param user User to index
   */
  async indexUser(user: User): Promise<void> {
    return this.userIndexService.indexUser(user);
  }
  
  /**
   * Remove user from indexes
   * @param userId User ID to remove
   */
  async removeUserIndex(userId: string): Promise<void> {
    return this.userIndexService.removeUser(userId);
  }
  
  /**
   * Update user indexes
   * @param user Updated user
   */
  async updateUserIndex(user: User): Promise<void> {
    return this.userIndexService.updateUser(user);
  }
  
  /**
   * Rebuild user indexes
   * @param users Collection of users
   */
  async rebuildUserIndexes(users: User[]): Promise<void> {
    return this.userIndexService.rebuildIndexes(users);
  }
  
  // User lookup operations
  
  /**
   * Find user by email
   * @param email Email to search for
   */
  async findUserByEmail(email: string): Promise<string | null> {
    return this.userIndexService.findByEmail(email);
  }
  
  /**
   * Find user by email or name
   * @param query Email or name to search for
   */
  async findUserByEmailOrName(query: string): Promise<string | null> {
    return this.userIndexService.findByEmailOrName(query);
  }
  
  /**
   * Find users by name
   * @param name Name or part of name
   * @param exactMatch Whether to find exact matches only
   */
  async findUsersByName(name: string, exactMatch = false): Promise<string[]> {
    return this.userIndexService.findByName(name, exactMatch);
  }
  
  // Review indexing operations
  
  /**
   * Index a review
   * @param review Review to index
   */
  async indexReview(review: Review): Promise<void> {
    return this.reviewIndexService.indexReview(review);
  }
  
  /**
   * Remove review from indexes
   * @param reviewId Review ID to remove
   */
  async removeReviewIndex(reviewId: string): Promise<void> {
    return this.reviewIndexService.removeReview(reviewId);
  }
  
  /**
   * Update review indexes
   * @param review Updated review
   */
  async updateReviewIndex(review: Review): Promise<void> {
    return this.reviewIndexService.updateReview(review);
  }
  
  /**
   * Rebuild review indexes
   * @param reviews Collection of reviews
   */
  async rebuildReviewIndexes(reviews: Review[]): Promise<void> {
    return this.reviewIndexService.rebuildIndexes(reviews);
  }
  
  // Review lookup operations
  
  /**
   * Find reviews by user
   * @param userId User ID
   */
  async findReviewsByUser(userId: string): Promise<string[]> {
    return this.reviewIndexService.findByUser(userId);
  }
  
  /**
   * Find reviews by book
   * @param bookId Book ID
   */
  async findReviewsByBook(bookId: string): Promise<string[]> {
    return this.reviewIndexService.findByBook(bookId);
  }
  
  /**
   * Find reviews by rating
   * @param rating Rating value
   */
  async findReviewsByRating(rating: number): Promise<string[]> {
    return this.reviewIndexService.findByRating(rating);
  }
  
  /**
   * Find reviews by rating range
   * @param minRating Minimum rating
   * @param maxRating Maximum rating
   */
  async findReviewsByRatingRange(minRating = 1, maxRating = 5): Promise<string[]> {
    return this.reviewIndexService.findByRatingRange(minRating, maxRating);
  }
  
  /**
   * Find reviews by date range
   * @param startDate Start date
   * @param endDate End date
   */
  async findReviewsByDateRange(startDate: Date, endDate: Date): Promise<string[]> {
    return this.reviewIndexService.findByDateRange(startDate, endDate);
  }
  
  /**
   * Clear all caches
   */
  clearCaches(): void {
    this.bookIndexService.clearCaches();
    this.userIndexService.clearCaches();
    this.reviewIndexService.clearCaches();
  }
}
