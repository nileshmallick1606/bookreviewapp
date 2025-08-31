/**
 * Enhanced Book Service Test Script
 * 
 * This script tests the enhanced book service that uses the new storage system.
 */
import {
  createBook,
  getBookById,
  updateBook,
  deleteBook,
  findBooksByTitle,
  findBooksByAuthor,
  findBooksByGenre
} from '../src/services/book/enhancedBook.service';

async function runEnhancedBookServiceTest() {
  console.log('=== ENHANCED BOOK SERVICE TEST ===');
  
  try {
    // Create test book
    console.log('\nCreating test book...');
    const bookData = {
      title: 'Test Enhanced Book',
      author: 'Test Author',
      description: 'A test book for the enhanced book service',
      genres: ['fiction', 'test'],
      publishedYear: 2023
    };
    
    const book = await createBook(bookData);
    console.log('✓ Book created:', book.id);
    
    // Get book by ID
    console.log('\nRetrieving book by ID...');
    const retrievedBook = await getBookById(book.id);
    console.log('✓ Book retrieved:', retrievedBook?.title);
    
    // Update book
    console.log('\nUpdating book...');
    const updates = {
      description: 'Updated description for testing',
      genres: ['fiction', 'test', 'updated']
    };
    
    const updatedBook = await updateBook(book.id, updates);
    console.log('✓ Book updated, new description:', updatedBook.description);
    
    // Find books by title
    console.log('\nFinding books by title...');
    const booksByTitle = await findBooksByTitle('Enhanced');
    console.log('✓ Found books by title:', booksByTitle.length);
    
    // Find books by author
    console.log('\nFinding books by author...');
    const booksByAuthor = await findBooksByAuthor('Test Author');
    console.log('✓ Found books by author:', booksByAuthor.length);
    
    // Find books by genre
    console.log('\nFinding books by genre...');
    const booksByGenre = await findBooksByGenre('fiction');
    console.log('✓ Found books by genre:', booksByGenre.length);
    
    // Delete book
    console.log('\nDeleting book...');
    await deleteBook(book.id);
    console.log('✓ Book deleted');
    
    // Verify book is deleted
    const deletedBook = await getBookById(book.id);
    console.log('✓ Book retrieval after deletion:', deletedBook === null ? 'Successfully deleted' : 'ERROR: Book still exists');
    
    console.log('\n✓ All enhanced book service tests passed successfully!');
  } catch (error) {
    console.error('Enhanced book service test failed:', error);
    process.exit(1);
  }
}

// Run the tests
runEnhancedBookServiceTest();
