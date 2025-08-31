/**
 * Integration Test for Storage Services
 * 
 * This test script verifies that all storage services work together correctly.
 */
import { StorageServiceProvider } from '../src/services/storageServiceProvider';
import { User } from '../src/services/storage/entityStorage/userStorage.service';
import { Book } from '../src/services/storage/entityStorage/bookStorage.service';
import { Review } from '../src/services/storage/entityStorage/reviewStorage.service';
import * as EnhancedBookService from '../src/services/book/enhancedBook.service';

async function runIntegrationTest() {
  console.log('=== STORAGE SERVICES INTEGRATION TEST ===');
  
  try {
    // Initialize storage provider
    console.log('\nInitializing storage services...');
    const provider = StorageServiceProvider.getInstance();
    await provider.initialize();
    console.log('✓ Storage services initialized');
    
    // Get service instances
    const userStorage = provider.getUserStorage();
    const bookStorage = provider.getBookStorage();
    const reviewStorage = provider.getReviewStorage();
    const indexManager = provider.getIndexManager();
    
    // Create test entities
    console.log('\nCreating test entities...');
    
    // Create user
    const testUser: User = {
      id: 'integration-test-user',
      name: 'Integration Test User',
      email: `integration-test-${Date.now()}@example.com`,
      password: 'hashedpassword',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await userStorage.create(testUser);
    console.log('✓ Created test user');
    
    // Create books using the enhanced book service
    console.log('\nCreating test books using enhanced book service...');
    
    const book1 = await EnhancedBookService.createBook({
      title: 'Integration Test Book 1',
      author: 'Test Author',
      description: 'A test book for integration testing',
      genres: ['fiction', 'test'],
      publishedYear: 2023
    });
    
    const book2 = await EnhancedBookService.createBook({
      title: 'Integration Test Book 2',
      author: 'Test Author',
      description: 'Another test book for integration testing',
      genres: ['non-fiction', 'test'],
      publishedYear: 2023
    });
    
    console.log('✓ Created test books');
    
    // Create reviews for the books
    console.log('\nCreating test reviews...');
    
    const review1: Review = {
      id: 'integration-test-review-1',
      userId: testUser.id,
      bookId: book1.id,
      rating: 4,
      text: 'This is a test review for the first book',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: []
    };
    
    const review2: Review = {
      id: 'integration-test-review-2',
      userId: testUser.id,
      bookId: book2.id,
      rating: 5,
      text: 'This is a test review for the second book',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: []
    };
    
    await reviewStorage.create(review1);
    await reviewStorage.create(review2);
    console.log('✓ Created test reviews');
    
    // Test calculating average ratings
    console.log('\nCalculating average ratings...');
    
    const rating1 = await EnhancedBookService.calculateAverageRating(book1.id);
    const rating2 = await EnhancedBookService.calculateAverageRating(book2.id);
    
    console.log(`✓ Book 1 rating: ${rating1}`);
    console.log(`✓ Book 2 rating: ${rating2}`);
    
    // Test search functionality
    console.log('\nTesting search functionality...');
    
    const booksByTitle = await EnhancedBookService.findBooksByTitle('Integration Test');
    console.log(`✓ Found ${booksByTitle.length} books by title`);
    
    const booksByAuthor = await EnhancedBookService.findBooksByAuthor('Test Author');
    console.log(`✓ Found ${booksByAuthor.length} books by author`);
    
    const fictionBooks = await EnhancedBookService.findBooksByGenre('fiction');
    console.log(`✓ Found ${fictionBooks.length} fiction books`);
    
    const nonFictionBooks = await EnhancedBookService.findBooksByGenre('non-fiction');
    console.log(`✓ Found ${nonFictionBooks.length} non-fiction books`);
    
    // Clean up
    console.log('\nCleaning up test data...');
    
    await reviewStorage.delete(review1.id);
    await reviewStorage.delete(review2.id);
    console.log('✓ Deleted test reviews');
    
    await EnhancedBookService.deleteBook(book1.id);
    await EnhancedBookService.deleteBook(book2.id);
    console.log('✓ Deleted test books');
    
    await userStorage.delete(testUser.id);
    console.log('✓ Deleted test user');
    
    console.log('\n✓ All integration tests passed successfully!');
  } catch (error) {
    console.error('Integration test failed:', error);
    process.exit(1);
  }
}

// Run the tests
runIntegrationTest();
