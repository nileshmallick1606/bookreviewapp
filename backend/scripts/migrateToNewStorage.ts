/**
 * Data Migration Script
 * 
 * This script migrates data from the old storage format to the new storage system.
 * It handles users, books, and reviews.
 */
import fs from 'fs/promises';
import path from 'path';
import { StorageServiceProvider } from '../src/services/storageServiceProvider';
import { User } from '../src/services/storage/entityStorage/userStorage.service';
import { Book } from '../src/services/storage/entityStorage/bookStorage.service';
import { Review } from '../src/services/storage/entityStorage/reviewStorage.service';

// Path constants
const DATA_DIR = path.join(process.cwd(), 'data');
const BOOKS_DIR = path.join(DATA_DIR, 'books');
const USERS_DIR = path.join(DATA_DIR, 'users');
const REVIEWS_DIR = path.join(DATA_DIR, 'reviews');

async function migrateData() {
  console.log('=== DATA MIGRATION TO NEW STORAGE SYSTEM ===');
  
  try {
    // Initialize storage provider
    console.log('\nInitializing storage services...');
    const provider = StorageServiceProvider.getInstance();
    await provider.initialize();
    console.log('✓ Storage services initialized');
    
    // Get storage services
    const userStorage = provider.getUserStorage();
    const bookStorage = provider.getBookStorage();
    const reviewStorage = provider.getReviewStorage();
    const indexManager = provider.getIndexManager();
    
    // Ensure directories exist
    await fs.mkdir(BOOKS_DIR, { recursive: true });
    await fs.mkdir(USERS_DIR, { recursive: true });
    await fs.mkdir(REVIEWS_DIR, { recursive: true });
    
    // Check if there are existing files to migrate
    let booksExist = false;
    let usersExist = false;
    let reviewsExist = false;
    
    try {
      const bookFiles = await fs.readdir(BOOKS_DIR);
      booksExist = bookFiles.length > 0;
    } catch (error) {
      console.log('No existing book files found');
    }
    
    try {
      const userFiles = await fs.readdir(USERS_DIR);
      usersExist = userFiles.length > 0;
    } catch (error) {
      console.log('No existing user files found');
    }
    
    try {
      const reviewFiles = await fs.readdir(REVIEWS_DIR);
      reviewsExist = reviewFiles.length > 0;
    } catch (error) {
      console.log('No existing review files found');
    }
    
    // Migrate users
    if (usersExist) {
      console.log('\nMigrating users...');
      const userFiles = await fs.readdir(USERS_DIR);
      
      for (const file of userFiles.filter(f => f.endsWith('.json'))) {
        const userId = path.basename(file, '.json');
        const content = await fs.readFile(path.join(USERS_DIR, file), 'utf-8');
        const oldUser = JSON.parse(content);
        
        // Map old user data to new format
        const newUser: User = {
          id: oldUser.id,
          name: `${oldUser.firstName || ''} ${oldUser.lastName || ''}`.trim() || oldUser.username,
          email: oldUser.email,
          password: oldUser.password,
          profileImage: oldUser.profileImage,
          createdAt: oldUser.createdAt,
          updatedAt: oldUser.updatedAt,
          preferences: {
            favoriteGenres: oldUser.preferences?.genres || [],
            notificationSettings: {
              email: oldUser.preferences?.emailNotifications || false
            }
          }
        };
        
        try {
          // Check if user already exists in new system
          const existingUser = await userStorage.getById(userId);
          
          if (existingUser) {
            console.log(`User ${userId} already migrated, skipping`);
          } else {
            // Create user in new system
            await userStorage.create(newUser);
            console.log(`✓ Migrated user: ${userId}`);
          }
        } catch (error) {
          console.error(`Error migrating user ${userId}:`, error);
        }
      }
      
      console.log(`✓ User migration complete. Migrated users: ${userFiles.length}`);
    } else {
      console.log('\nNo users to migrate');
    }
    
    // Migrate books
    if (booksExist) {
      console.log('\nMigrating books...');
      const bookFiles = await fs.readdir(BOOKS_DIR);
      
      for (const file of bookFiles.filter(f => f.endsWith('.json'))) {
        const bookId = path.basename(file, '.json');
        const content = await fs.readFile(path.join(BOOKS_DIR, file), 'utf-8');
        const oldBook = JSON.parse(content);
        
        // Map old book data to new format
        const newBook: Book = {
          id: oldBook.id,
          title: oldBook.title,
          author: oldBook.author,
          description: oldBook.summary || oldBook.description || '',
          genres: Array.isArray(oldBook.genre) ? oldBook.genre : 
                 (oldBook.genres || []),
          publishedYear: oldBook.publishedYear || 
                        (oldBook.publishedDate ? new Date(oldBook.publishedDate).getFullYear() : 0),
          coverImage: oldBook.coverImage,
          createdAt: oldBook.createdAt,
          updatedAt: oldBook.updatedAt,
          averageRating: oldBook.averageRating,
          totalReviews: oldBook.totalReviews || oldBook.totalRatings || 0
        };
        
        try {
          // Check if book already exists in new system
          const existingBook = await bookStorage.getById(bookId);
          
          if (existingBook) {
            console.log(`Book ${bookId} already migrated, skipping`);
          } else {
            // Create book in new system
            await bookStorage.create(newBook);
            
            // Index the book
            await indexManager.indexBook(newBook);
            
            console.log(`✓ Migrated book: ${bookId} - ${newBook.title}`);
          }
        } catch (error) {
          console.error(`Error migrating book ${bookId}:`, error);
        }
      }
      
      console.log(`✓ Book migration complete. Migrated books: ${bookFiles.length}`);
    } else {
      console.log('\nNo books to migrate');
    }
    
    // Migrate reviews
    if (reviewsExist) {
      console.log('\nMigrating reviews...');
      const reviewFiles = await fs.readdir(REVIEWS_DIR);
      
      for (const file of reviewFiles.filter(f => f.endsWith('.json'))) {
        const reviewId = path.basename(file, '.json');
        const content = await fs.readFile(path.join(REVIEWS_DIR, file), 'utf-8');
        const oldReview = JSON.parse(content);
        
        // Map old review data to new format
        const newReview: Review = {
          id: oldReview.id,
          userId: oldReview.userId,
          bookId: oldReview.bookId,
          rating: oldReview.rating,
          text: oldReview.content || oldReview.text || '',
          createdAt: oldReview.createdAt,
          updatedAt: oldReview.updatedAt,
          likes: Array.isArray(oldReview.likes) ? oldReview.likes : [],
          comments: oldReview.comments || []
        };
        
        try {
          // Check if review already exists in new system
          const existingReview = await reviewStorage.getById(reviewId);
          
          if (existingReview) {
            console.log(`Review ${reviewId} already migrated, skipping`);
          } else {
            // Create review in new system
            await reviewStorage.create(newReview);
            console.log(`✓ Migrated review: ${reviewId}`);
          }
        } catch (error) {
          console.error(`Error migrating review ${reviewId}:`, error);
        }
      }
      
      console.log(`✓ Review migration complete. Migrated reviews: ${reviewFiles.length}`);
    } else {
      console.log('\nNo reviews to migrate');
    }
    
    // Update indexes
    console.log('\nRebuilding indexes...');
    const books = await bookStorage.getAll();
    await indexManager.rebuildBookIndexes(books);
    console.log('✓ Indexes rebuilt');
    
    console.log('\n✓ Data migration complete!');
  } catch (error) {
    console.error('Data migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateData();
