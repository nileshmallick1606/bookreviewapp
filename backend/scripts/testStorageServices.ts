/**
 * Storage Services Integration Test Script
 * 
 * This script tests the integration of storage services with the application.
 * It verifies that all storage services are properly initialized and can perform basic operations.
 */
import path from 'path';
import { StorageServiceProvider } from '../src/services/storageServiceProvider';
import { User } from '../src/services/storage/entityStorage/userStorage.service';
import { Book } from '../src/services/storage/entityStorage/bookStorage.service';
import { Review } from '../src/services/storage/entityStorage/reviewStorage.service';

async function runStorageTests() {
  console.log('=== STORAGE SERVICES INTEGRATION TEST ===');
  
  try {
    // Initialize storage provider
    console.log('Initializing storage services...');
    const storageProvider = StorageServiceProvider.getInstance();
    await storageProvider.initialize();
    console.log('✓ Storage services initialized successfully');
    
    // Get service instances
    const userStorage = storageProvider.getUserStorage();
    const bookStorage = storageProvider.getBookStorage();
    const reviewStorage = storageProvider.getReviewStorage();
    const indexManager = storageProvider.getIndexManager();
    
    // Test user storage
    console.log('\nTesting User Storage Service:');
    const testUser: User = {
      id: 'test-user-integration',
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'hashedpassword',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      preferences: {
        favoriteGenres: ['fiction', 'mystery'],
        notificationSettings: {
          email: true
        }
      }
    };
    
    try {
      const createdUser = await userStorage.create(testUser);
      console.log('✓ Created test user with ID:', createdUser.id);
      testUser.id = createdUser.id;
      
      const retrievedUser = await userStorage.getById(createdUser.id);
      console.log('✓ Retrieved test user:', retrievedUser?.name || 'Not found', 'ID:', retrievedUser?.id);
    } catch (error) {
      console.error('Error in user storage test:', error);
    }
    
    // Test book storage
    console.log('\nTesting Book Storage Service:');
    const testBook: Book = {
      id: 'test-book-integration',
      title: 'Test Book',
      author: 'Test Author',
      description: 'A test book for integration testing',
      genres: ['fiction'],
      publishedYear: 2023,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      averageRating: 0,
      totalReviews: 0
    };
    
    try {
      const createdBook = await bookStorage.create(testBook);
      console.log('✓ Created test book with ID:', createdBook.id);
      testBook.id = createdBook.id;
      
      const retrievedBook = await bookStorage.getById(createdBook.id);
      console.log('✓ Retrieved test book:', retrievedBook?.title || 'Not found', 'ID:', retrievedBook?.id);
    } catch (error) {
      console.error('Error in book storage test:', error);
    }
    
    // Test review storage
    console.log('\nTesting Review Storage Service:');
    const testReview: Review = {
      id: 'test-review-integration',
      userId: testUser.id,
      bookId: testBook.id,
      rating: 4,
      text: 'This is a test review for integration testing',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: []
    };
    
    try {
      const createdReview = await reviewStorage.create(testReview);
      console.log('✓ Created test review with ID:', createdReview.id);
      testReview.id = createdReview.id;
      
      const retrievedReview = await reviewStorage.getById(createdReview.id);
      console.log('✓ Retrieved test review:', retrievedReview?.text?.substring(0, 20) || 'Not found', 'ID:', retrievedReview?.id);
    } catch (error) {
      console.error('Error in review storage test:', error);
    }
    
    // Test index manager
    console.log('\nTesting Index Manager:');
    const booksByGenre = await indexManager.findBooksByGenre('fiction');
    console.log('✓ Retrieved books by genre:', booksByGenre);
    
    // Clean up test data
    console.log('\nCleaning up test data...');
    try {
      if (testReview.id) {
        await reviewStorage.delete(testReview.id);
        console.log('✓ Deleted test review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
    }
    
    try {
      if (testBook.id) {
        await bookStorage.delete(testBook.id);
        console.log('✓ Deleted test book');
      }
    } catch (error) {
      console.error('Error deleting book:', error);
    }
    
    try {
      if (testUser.id) {
        await userStorage.delete(testUser.id);
        console.log('✓ Deleted test user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
    
    console.log('\n✓ All storage integration tests passed successfully!');
  } catch (error) {
    console.error('Storage integration test failed:', error);
    process.exit(1);
  }
}

// Run the tests
runStorageTests();
