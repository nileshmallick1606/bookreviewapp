// src/services/bookService.ts
import * as enhancedBookService from './book/enhancedBook.service';
import * as legacyBookService from './book/book.service';
import { BookService } from '../types/services';
import { StorageServiceProvider } from './storageServiceProvider';

// Define the Book interface here to match the one from enhancedBookService
export interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  coverImage?: string;
  genres?: string[];
  averageRating?: number;
  totalReviews?: number;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

/**
 * Get a book by ID
 * @param bookId The book ID to retrieve
 * @returns The book object or null if not found
 */
export const getBookById = async (bookId: string): Promise<Book | null> => {
  try {
    return await enhancedBookService.getBookById(bookId) as Book | null;
  } catch (error) {
    console.warn(`Error using enhanced service for getBookById, falling back to legacy: ${error}`);
    // Legacy service might not have this method
    throw error;
  }
};

/**
 * Search for books based on query string and optional parameters
 * @param query Search query string
 * @param page Page number for pagination (default: 1)
 * @param limit Number of results per page (default: 10)
 * @param sortBy Field to sort by (default: 'title')
 * @param sortOrder Sort order, 'asc' or 'desc' (default: 'asc')
 * @returns Object containing books array and total count
 */
export const searchBooks = async (
  query: string,
  page: number = 1,
  limit: number = 10,
  sortBy: string = 'title',
  sortOrder: string = 'asc'
): Promise<{ books: Book[]; total: number }> => {
  try {
    // Implement search logic combining results from different search functions
    const titleResults = await enhancedBookService.findBooksByTitle(query, false) as Book[];
    const authorResults = await enhancedBookService.findBooksByAuthor(query, false) as Book[];
    
    // Combine and deduplicate results
    const combinedResults = [...titleResults];
    for (const book of authorResults) {
      if (!combinedResults.some(b => b.id === book.id)) {
        combinedResults.push(book);
      }
    }
    
    // Sort results
    const sortedResults = combinedResults.sort((a, b) => {
      const valueA = a[sortBy] || '';
      const valueB = b[sortBy] || '';
      
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortOrder === 'asc' 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA);
      }
      
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
      }
      
      return 0;
    });
    
    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = sortedResults.slice(startIndex, endIndex);
    
    return {
      books: paginatedResults,
      total: combinedResults.length
    };
  } catch (error) {
    console.error(`Error searching books: ${error}`);
    return { books: [], total: 0 };
  }
};

/**
 * Get book suggestions for a user
 * @param userId User ID to get suggestions for
 * @param limit Maximum number of suggestions to return (default: 10)
 * @returns Array of suggested books
 */
export const getSuggestions = async (userId: string, limit: number = 10): Promise<Book[]> => {
  try {
    // Implementation for getting suggestions
    // This could use multiple service methods to create recommendations
    
    // For now, just return top rated books as a suggestion
    const provider = StorageServiceProvider.getInstance();
    await provider.initialize();
    const bookStorage = provider.getBookStorage();
    const books = await bookStorage.getAll() as Book[];
    
    return books
      .filter(book => book.averageRating !== null && book.averageRating !== undefined)
      .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
      .slice(0, limit);
  } catch (error) {
    console.error(`Error getting book suggestions: ${error}`);
    return [];
  }
};

/**
 * Update the average rating for a book when reviews are added/updated/deleted
 * @param bookId The ID of the book to update
 */
export const updateAverageRating = async (bookId: string): Promise<void> => {
  try {
    await enhancedBookService.calculateAverageRating(bookId);
  } catch (error) {
    console.warn(`Error using enhanced service for calculateAverageRating: ${error}`);
    try {
      await legacyBookService.calculateAverageRating(bookId);
    } catch (legacyError) {
      console.error(`Error in legacy calculateAverageRating: ${legacyError}`);
      throw legacyError;
    }
  }
};
