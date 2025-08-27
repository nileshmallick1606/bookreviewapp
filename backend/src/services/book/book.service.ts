import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { getReviewsByBook } from '../review/review.service';
import { FileSystemError, NotFoundError } from '../../utils/errors';
import { fileExists } from '../../utils/file';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const BOOKS_DIR = path.join(process.cwd(), 'data', 'books');

// Dummy book interface for rating calculation
interface Book {
  id: string;
  title: string;
  averageRating?: number | null;
  totalReviews?: number;
  [key: string]: any;
}

// Calculate and update a book's average rating
export const calculateAverageRating = async (bookId: string): Promise<number | null> => {
  const bookPath = path.join(BOOKS_DIR, `${bookId}.json`);
  
  if (!(await fileExists(bookPath))) {
    throw new NotFoundError(`Book not found: ${bookId}`);
  }
  
  try {
    // Get book data
    const bookData = await readFile(bookPath, 'utf-8');
    const book = JSON.parse(bookData) as Book;
    
    // Get all reviews for this book
    const reviews = await getReviewsByBook(bookId);
    
    if (reviews.length === 0) {
      // No reviews, set to null to indicate no ratings
      book.averageRating = null;
      book.totalReviews = 0;
    } else {
      // Calculate average rating
      const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
      const average = sum / reviews.length;
      
      // Update book data
      book.averageRating = parseFloat(average.toFixed(1)); // Round to 1 decimal place
      book.totalReviews = reviews.length;
    }
    
    // Save updated book
    await writeFile(bookPath, JSON.stringify(book, null, 2));
    
    return book.averageRating;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new FileSystemError('Failed to update book rating');
  }
};
