/**
 * Enhanced Book Service
 * 
 * This service uses the new storage system for book operations.
 * It integrates with the StorageServiceProvider for CRUD operations.
 */
import { Book } from '../storage/entityStorage/bookStorage.service';
import { Review } from '../storage/entityStorage/reviewStorage.service';
import { StorageServiceProvider } from '../storageServiceProvider';
import { FileSystemError, NotFoundError } from '../../utils/errors';

// Singleton instance of the storage provider
let storageProvider: StorageServiceProvider;

/**
 * Initialize the storage provider if not already initialized
 */
const initStorageProvider = async (): Promise<StorageServiceProvider> => {
  if (!storageProvider) {
    storageProvider = StorageServiceProvider.getInstance();
    await storageProvider.initialize();
  }
  return storageProvider;
};

/**
 * Get a book by ID
 * @param bookId Book ID
 * @returns Book or null if not found
 */
export const getBookById = async (bookId: string): Promise<Book | null> => {
  const provider = await initStorageProvider();
  const bookStorage = provider.getBookStorage();
  
  try {
    const book = await bookStorage.getById(bookId);
    return book;
  } catch (error) {
    console.error(`Error getting book ${bookId}:`, error);
    throw new FileSystemError(`Failed to retrieve book ${bookId}`);
  }
};

/**
 * Create a new book
 * @param bookData Book data
 * @returns Created book
 */
export const createBook = async (bookData: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>): Promise<Book> => {
  const provider = await initStorageProvider();
  const bookStorage = provider.getBookStorage();
  const indexManager = provider.getIndexManager();
  
  try {
    // Create the book
    const book = await bookStorage.create(bookData);
    
    // Index the book
    await indexManager.indexBook(book);
    
    return book;
  } catch (error) {
    console.error('Error creating book:', error);
    throw new FileSystemError('Failed to create book');
  }
};

/**
 * Update a book
 * @param bookId Book ID
 * @param updates Book data updates
 * @returns Updated book
 */
export const updateBook = async (bookId: string, updates: Partial<Omit<Book, 'id' | 'createdAt'>>): Promise<Book> => {
  const provider = await initStorageProvider();
  const bookStorage = provider.getBookStorage();
  const indexManager = provider.getIndexManager();
  
  try {
    // Update the book
    const book = await bookStorage.update(bookId, updates);
    
    // Update book in indexes
    await indexManager.updateBookIndex(book);
    
    return book;
  } catch (error) {
    console.error(`Error updating book ${bookId}:`, error);
    if (error instanceof Error && error.message.includes('not found')) {
      throw new NotFoundError(`Book not found: ${bookId}`);
    }
    throw new FileSystemError(`Failed to update book ${bookId}`);
  }
};

/**
 * Delete a book
 * @param bookId Book ID
 * @returns True if deleted, false if not found
 */
export const deleteBook = async (bookId: string): Promise<boolean> => {
  const provider = await initStorageProvider();
  const bookStorage = provider.getBookStorage();
  const indexManager = provider.getIndexManager();
  
  try {
    // Check if book exists
    const book = await bookStorage.getById(bookId);
    if (!book) {
      return false;
    }
    
    // Remove book from indexes
    await indexManager.removeBookIndex(bookId);
    
    // Delete the book
    return await bookStorage.delete(bookId);
  } catch (error) {
    console.error(`Error deleting book ${bookId}:`, error);
    throw new FileSystemError(`Failed to delete book ${bookId}`);
  }
};

/**
 * Calculate and update a book's average rating
 * @param bookId Book ID
 * @returns Updated average rating
 */
export const calculateAverageRating = async (bookId: string): Promise<number | null> => {
  const provider = await initStorageProvider();
  const bookStorage = provider.getBookStorage();
  const reviewStorage = provider.getReviewStorage();
  
  try {
    // Get book data
    const book = await bookStorage.getById(bookId);
    if (!book) {
      throw new NotFoundError(`Book not found: ${bookId}`);
    }
    
    // Get all reviews for this book
    const allReviews = await reviewStorage.getAll();
    const reviews = allReviews.filter(review => review.bookId === bookId);
    
    let averageRating: number | null = null;
    let updates: Partial<Book> = {};
    
    if (reviews.length === 0) {
      // No reviews, set to undefined to indicate no ratings
      updates = {
        averageRating: undefined,
        totalReviews: 0
      };
    } else {
      // Calculate average rating
      const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
      const average = sum / reviews.length;
      
      // Calculate rating distribution
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      reviews.forEach(review => {
        if (review.rating >= 1 && review.rating <= 5) {
          distribution[review.rating as keyof typeof distribution]++;
        }
      });
      
      // Update book data
      averageRating = parseFloat(average.toFixed(1)); // Round to 1 decimal place
      
      updates = {
        averageRating,
        totalReviews: reviews.length
      };
    }
    
    // Update the book
    await bookStorage.update(bookId, updates);
    
    // After updating the individual book rating, update the top-rated books index
    try {
      await updateTopRatedBooksIndex();
    } catch (indexError) {
      console.error('Error updating top-rated books index:', indexError);
      // Don't fail the whole operation if just the index update fails
    }
    
    return updates.averageRating || null;
  } catch (error) {
    console.error(`Error calculating average rating for book ${bookId}:`, error);
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new FileSystemError('Failed to update book rating');
  }
};

/**
 * Update the top-rated books index
 */
export const updateTopRatedBooksIndex = async (): Promise<void> => {
  const provider = await initStorageProvider();
  const bookStorage = provider.getBookStorage();
  const indexManager = provider.getIndexManager();
  
  try {
    // Get all books
    const books = await bookStorage.getAll();
    
    // Filter books with ratings and sort by rating (descending)
    const topRatedBooks = books
      .filter(book => book.averageRating !== null && book.averageRating !== undefined)
      .sort((a, b) => {
        const ratingA = a.averageRating || 0;
        const ratingB = b.averageRating || 0;
        return ratingB - ratingA;
      })
      .slice(0, 50); // Top 50 books
    
    // Rebuild the rating index
    await indexManager.rebuildBookIndexes(topRatedBooks);
  } catch (error) {
    console.error('Error updating top-rated books index:', error);
    throw new FileSystemError('Failed to update top-rated books index');
  }
};

/**
 * Find books by title
 * @param title Book title or part of title
 * @param exact Whether to match exactly
 * @returns Array of book IDs
 */
export const findBooksByTitle = async (title: string, exact = false): Promise<Book[]> => {
  const provider = await initStorageProvider();
  const bookStorage = provider.getBookStorage();
  const indexManager = provider.getIndexManager();
  
  try {
    const bookIds = await indexManager.findBooksByTitle(title, exact);
    
    // Get full book objects
    const books: (Book | null)[] = await Promise.all(
      bookIds.map(id => bookStorage.getById(id))
    );
    
    // Filter out nulls (in case a book was deleted but still in index)
    return books.filter((book): book is Book => book !== null);
  } catch (error) {
    console.error(`Error finding books by title "${title}":`, error);
    throw new FileSystemError('Failed to search books by title');
  }
};

/**
 * Find books by author
 * @param author Author name or part of name
 * @param exact Whether to match exactly
 * @returns Array of book objects
 */
export const findBooksByAuthor = async (author: string, exact = false): Promise<Book[]> => {
  const provider = await initStorageProvider();
  const bookStorage = provider.getBookStorage();
  const indexManager = provider.getIndexManager();
  
  try {
    const bookIds = await indexManager.findBooksByAuthor(author, exact);
    
    // Get full book objects
    const books: (Book | null)[] = await Promise.all(
      bookIds.map(id => bookStorage.getById(id))
    );
    
    // Filter out nulls (in case a book was deleted but still in index)
    return books.filter((book): book is Book => book !== null);
  } catch (error) {
    console.error(`Error finding books by author "${author}":`, error);
    throw new FileSystemError('Failed to search books by author');
  }
};

/**
 * Find books by genre
 * @param genre Genre to search for
 * @returns Array of book objects
 */
export const findBooksByGenre = async (genre: string): Promise<Book[]> => {
  const provider = await initStorageProvider();
  const bookStorage = provider.getBookStorage();
  const indexManager = provider.getIndexManager();
  
  try {
    const bookIds = await indexManager.findBooksByGenre(genre);
    
    // Get full book objects
    const books: (Book | null)[] = await Promise.all(
      bookIds.map(id => bookStorage.getById(id))
    );
    
    // Filter out nulls (in case a book was deleted but still in index)
    return books.filter((book): book is Book => book !== null);
  } catch (error) {
    console.error(`Error finding books by genre "${genre}":`, error);
    throw new FileSystemError('Failed to search books by genre');
  }
};

/**
 * Get all available genres
 * @returns Array of genre names
 */
export const getAllGenres = async (): Promise<string[]> => {
  const provider = await initStorageProvider();
  const indexManager = provider.getIndexManager();
  
  try {
    return await indexManager.getAllGenres();
  } catch (error) {
    console.error('Error getting all genres:', error);
    throw new FileSystemError('Failed to get genres');
  }
};
