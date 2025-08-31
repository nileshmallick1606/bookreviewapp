/**
 * Data Migration Service
 * 
 * Handles data migration between different storage systems or versions.
 * Implements US 9.3: Data Migration.
 */
import fs from 'fs/promises';
import path from 'path';
import { FileStorageManager } from '../storage/fileStorageManager';
import { IndexManager } from '../indexing/index.manager';
import { Book } from '../storage/entityStorage/bookStorage.service';
import { User } from '../storage/entityStorage/userStorage.service';
import { Review } from '../storage/entityStorage/reviewStorage.service';
import { BookStorageService } from '../storage/entityStorage/bookStorage.service';
import { UserStorageService } from '../storage/entityStorage/userStorage.service';
import { ReviewStorageService } from '../storage/entityStorage/reviewStorage.service';
import { LockManager } from '../storage/lockManager';

export interface MigrationOptions {
  sourceDir: string;
  targetDir: string;
  entities: ('books' | 'users' | 'reviews')[];
  rebuildIndexes?: boolean;
}

export interface MigrationResult {
  success: boolean;
  migratedEntities: {
    books?: number;
    users?: number;
    reviews?: number;
  };
  errors?: string[];
}

export class DataMigrationService {
  private fileManager: FileStorageManager;
  private lockManager: LockManager;
  
  constructor() {
    this.fileManager = new FileStorageManager();
    this.lockManager = new LockManager(path.join(process.cwd(), 'data', 'locks'));
  }
  
  /**
   * Migrate data from one storage location to another
   * @param options Migration options
   */
  async migrateData(options: MigrationOptions): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: true,
      migratedEntities: {},
      errors: []
    };
    
    try {
      // Create target directories if they don't exist
      await this.fileManager.ensureDirectory(options.targetDir);
      
      // Migrate entities
      for (const entity of options.entities) {
        try {
          switch (entity) {
            case 'books':
              result.migratedEntities.books = await this.migrateBooks(options);
              break;
            case 'users':
              result.migratedEntities.users = await this.migrateUsers(options);
              break;
            case 'reviews':
              result.migratedEntities.reviews = await this.migrateReviews(options);
              break;
          }
        } catch (error) {
          result.success = false;
          result.errors?.push(`Error migrating ${entity}: ${error}`);
        }
      }
      
      // Rebuild indexes if needed
      if (options.rebuildIndexes) {
        await this.rebuildIndexes(options.targetDir);
      }
      
    } catch (error) {
      result.success = false;
      result.errors?.push(`Migration failed: ${error}`);
    }
    
    return result;
  }
  
  /**
   * Migrate books from one storage to another
   * @param options Migration options
   * @returns Number of migrated books
   */
  private async migrateBooks(options: MigrationOptions): Promise<number> {
    const sourceBookDir = path.join(options.sourceDir, 'books');
    const targetBookDir = path.join(options.targetDir, 'books');
    
    // Create source and target storage services
    const sourceStorage = new BookStorageService(sourceBookDir, this.lockManager, this.fileManager);
    const targetStorage = new BookStorageService(targetBookDir, this.lockManager, this.fileManager);
    
    // Get all books from source
    const books = await sourceStorage.getAll();
    
    // Save all books to target
    let migrated = 0;
    
    for (const book of books) {
      try {
        // Create new book in target storage with the same ID
        await this.fileManager.ensureDirectory(targetBookDir);
        const bookFile = path.join(targetBookDir, `${book.id}.json`);
        await this.fileManager.writeJsonFile(bookFile, book);
        migrated++;
      } catch (error) {
        console.error(`Error migrating book ${book.id}: ${error}`);
        throw new Error(`Failed to migrate book ${book.id}`);
      }
    }
    
    return migrated;
  }
  
  /**
   * Migrate users from one storage to another
   * @param options Migration options
   * @returns Number of migrated users
   */
  private async migrateUsers(options: MigrationOptions): Promise<number> {
    const sourceUserDir = path.join(options.sourceDir, 'users');
    const targetUserDir = path.join(options.targetDir, 'users');
    
    // Create source and target storage services
    const sourceStorage = new UserStorageService(sourceUserDir, this.lockManager, this.fileManager);
    const targetStorage = new UserStorageService(targetUserDir, this.lockManager, this.fileManager);
    
    // Get all users from source
    const users = await sourceStorage.getAll();
    
    // Save all users to target
    let migrated = 0;
    
    for (const user of users) {
      try {
        // Create new user in target storage with the same ID
        await this.fileManager.ensureDirectory(targetUserDir);
        const userFile = path.join(targetUserDir, `${user.id}.json`);
        await this.fileManager.writeJsonFile(userFile, user);
        migrated++;
      } catch (error) {
        console.error(`Error migrating user ${user.id}: ${error}`);
        throw new Error(`Failed to migrate user ${user.id}`);
      }
    }
    
    return migrated;
  }
  
  /**
   * Migrate reviews from one storage to another
   * @param options Migration options
   * @returns Number of migrated reviews
   */
  private async migrateReviews(options: MigrationOptions): Promise<number> {
    const sourceReviewDir = path.join(options.sourceDir, 'reviews');
    const targetReviewDir = path.join(options.targetDir, 'reviews');
    
    // Create source and target storage services
    const sourceStorage = new ReviewStorageService(sourceReviewDir, this.lockManager, this.fileManager);
    const targetStorage = new ReviewStorageService(targetReviewDir, this.lockManager, this.fileManager);
    
    // Get all reviews from source
    const reviews = await sourceStorage.getAll();
    
    // Save all reviews to target
    let migrated = 0;
    
    for (const review of reviews) {
      try {
        // Create new review in target storage with the same ID
        await this.fileManager.ensureDirectory(targetReviewDir);
        const reviewFile = path.join(targetReviewDir, `${review.id}.json`);
        await this.fileManager.writeJsonFile(reviewFile, review);
        migrated++;
      } catch (error) {
        console.error(`Error migrating review ${review.id}: ${error}`);
        throw new Error(`Failed to migrate review ${review.id}`);
      }
    }
    
    return migrated;
  }
  
  /**
   * Rebuild indexes for the target storage
   * @param dataDir Target data directory
   */
  private async rebuildIndexes(dataDir: string): Promise<void> {
    try {
      // Create index manager
      const indexManager = new IndexManager(dataDir);
      
      // Initialize indexes
      await indexManager.initIndexes();
      
      // Get all entities
      const bookStorage = new BookStorageService(path.join(dataDir, 'books'), this.lockManager, this.fileManager);
      const userStorage = new UserStorageService(path.join(dataDir, 'users'), this.lockManager, this.fileManager);
      const reviewStorage = new ReviewStorageService(path.join(dataDir, 'reviews'), this.lockManager, this.fileManager);
      
      const books = await bookStorage.getAll();
      const users = await userStorage.getAll();
      const reviews = await reviewStorage.getAll();
      
      // Rebuild indexes
      await Promise.all([
        indexManager.rebuildBookIndexes(books),
        indexManager.rebuildUserIndexes(users),
        indexManager.rebuildReviewIndexes(reviews)
      ]);
    } catch (error) {
      console.error(`Error rebuilding indexes: ${error}`);
      throw new Error('Failed to rebuild indexes');
    }
  }
  
  /**
   * Validate data consistency
   * @param dataDir Data directory to validate
   * @returns Object containing validation results
   */
  async validateDataConsistency(dataDir: string): Promise<{
    isValid: boolean;
    issues: string[];
    bookCount: number;
    userCount: number;
    reviewCount: number;
  }> {
    const issues: string[] = [];
    let bookCount = 0;
    let userCount = 0;
    let reviewCount = 0;
    
    try {
      // Check directory structure
      const requiredDirs = ['books', 'users', 'reviews', 'indexes', 'locks'];
      for (const dir of requiredDirs) {
        const dirPath = path.join(dataDir, dir);
        try {
          await fs.access(dirPath);
        } catch (error) {
          issues.push(`Missing directory: ${dirPath}`);
        }
      }
      
      // Create storage services
      const bookStorage = new BookStorageService(path.join(dataDir, 'books'), this.lockManager, this.fileManager);
      const userStorage = new UserStorageService(path.join(dataDir, 'users'), this.lockManager, this.fileManager);
      const reviewStorage = new ReviewStorageService(path.join(dataDir, 'reviews'), this.lockManager, this.fileManager);
      
      // Check books
      try {
        const books = await bookStorage.getAll();
        bookCount = books.length;
        
        // Validate book integrity
        for (const book of books) {
          if (!book.id || !book.title || !book.author) {
            issues.push(`Invalid book data: ${JSON.stringify(book)}`);
          }
        }
      } catch (error) {
        issues.push(`Error reading books: ${error}`);
      }
      
      // Check users
      try {
        const users = await userStorage.getAll();
        userCount = users.length;
        
        // Validate user integrity
        for (const user of users) {
          if (!user.id || !user.email || !user.name) {
            issues.push(`Invalid user data: ${JSON.stringify(user)}`);
          }
        }
      } catch (error) {
        issues.push(`Error reading users: ${error}`);
      }
      
      // Check reviews
      try {
        const reviews = await reviewStorage.getAll();
        reviewCount = reviews.length;
        
        // Validate review integrity
        for (const review of reviews) {
          if (!review.id || !review.userId || !review.bookId || review.rating < 1 || review.rating > 5) {
            issues.push(`Invalid review data: ${JSON.stringify(review)}`);
          }
          
          // Check if referenced user exists
          try {
            const user = await userStorage.getById(review.userId);
            if (!user) {
              issues.push(`Review ${review.id} references non-existent user ${review.userId}`);
            }
          } catch (error) {
            issues.push(`Error checking user reference in review ${review.id}: ${error}`);
          }
          
          // Check if referenced book exists
          try {
            const book = await bookStorage.getById(review.bookId);
            if (!book) {
              issues.push(`Review ${review.id} references non-existent book ${review.bookId}`);
            }
          } catch (error) {
            issues.push(`Error checking book reference in review ${review.id}: ${error}`);
          }
        }
      } catch (error) {
        issues.push(`Error reading reviews: ${error}`);
      }
      
    } catch (error) {
      issues.push(`Validation failed: ${error}`);
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      bookCount,
      userCount,
      reviewCount
    };
  }
}
