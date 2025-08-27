import { Book } from '../models/interfaces/book.interface';

/**
 * Prepare book object for API response by removing any deprecated properties
 * and ensuring correct handling of ratings
 * 
 * @param book The book object to prepare
 * @returns A book object ready for API response
 */
export function prepareBookForResponse(book: Book): Book {
  // Create a new book object without the reviewCount property
  const { reviewCount, ...cleanBook } = book as Book & { reviewCount?: number };
  
  // Ensure averageRating is null if there are no reviews
  if (!cleanBook.totalReviews || cleanBook.totalReviews <= 0) {
    cleanBook.averageRating = null;
  }
  
  return cleanBook;
}

/**
 * Prepare an array of book objects for API response
 * @param books The array of book objects to prepare
 * @returns An array of book objects ready for API response
 */
export function prepareBookArrayForResponse(books: Book[]): Book[] {
  return books.map(prepareBookForResponse);
}
