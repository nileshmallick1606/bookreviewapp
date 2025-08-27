import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { getReviewsByBook } from '../review/review.service';
import { FileSystemError, NotFoundError } from '../../utils/errors';
import { fileExists } from '../../utils/file';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);
const mkdir = promisify(fs.mkdir);

const BOOKS_DIR = path.join(process.cwd(), 'data', 'books');
const INDEXES_DIR = path.join(process.cwd(), 'data', 'indexes');

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
      book.ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
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
      book.averageRating = parseFloat(average.toFixed(1)); // Round to 1 decimal place
      book.totalReviews = reviews.length;
      book.ratingDistribution = distribution;
    }
    
    // Save updated book
    await writeFile(bookPath, JSON.stringify(book, null, 2));
    
    // After updating the individual book rating, update the top-rated books index
    try {
      await updateTopRatedBooksIndex();
    } catch (indexError) {
      console.error('Error updating top-rated books index:', indexError);
      // Don't fail the whole operation if just the index update fails
    }
    
    return book.averageRating;
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
 * This creates an index of book IDs sorted by their average rating
 */
export const updateTopRatedBooksIndex = async (): Promise<void> => {
  try {
    const topRatedIndexPath = path.join(INDEXES_DIR, 'topRatedBooks.json');
    
    // Ensure indexes directory exists
    await mkdir(INDEXES_DIR, { recursive: true });
    
    // Read all book files
    const fileNames = await readdir(BOOKS_DIR);
    const bookPromises = fileNames.map(async (fileName) => {
      const filePath = path.join(BOOKS_DIR, fileName);
      const fileContent = await readFile(filePath, 'utf-8');
      return JSON.parse(fileContent) as Book;
    });
    
    const books = await Promise.all(bookPromises);
    
    // Filter books with ratings and sort by rating (descending)
    const topRatedBooks = books
      .filter(book => book.averageRating !== null && book.averageRating !== undefined)
      .sort((a, b) => {
        const ratingA = a.averageRating || 0;
        const ratingB = b.averageRating || 0;
        return ratingB - ratingA;
      })
      .slice(0, 50) // Top 50 books
      .map(book => ({
        id: book.id,
        title: book.title,
        author: book.author,
        coverImage: book.coverImage,
        averageRating: book.averageRating,
        totalReviews: book.totalReviews
      }));
    
    // Save the top-rated books index
    await writeFile(topRatedIndexPath, JSON.stringify(topRatedBooks, null, 2));
  } catch (error) {
    console.error('Error updating top-rated books index:', error);
    throw new FileSystemError('Failed to update top-rated books index');
  }
};
