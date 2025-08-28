import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { FileSystemError, NotFoundError } from '../../utils/errors';
import { fileExists } from '../../utils/file';
import { Book } from '../../models/interfaces/book.interface';
import { User } from '../../models/interfaces/user.interface';
import { Review } from '../../models/interfaces/review.interface';
import { OpenAIService } from '../ai/openai.service';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);
const mkdir = promisify(fs.mkdir);

// Initialize OpenAI service
const openaiService = new OpenAIService();

const BOOKS_DIR = path.join(process.cwd(), 'data', 'books');
const INDEXES_DIR = path.join(process.cwd(), 'data', 'indexes');
const TOP_RATED_BOOKS_PATH = path.join(INDEXES_DIR, 'topRatedBooks.json');
const RECOMMENDATIONS_DIR = path.join(process.cwd(), 'data', 'recommendations');

// Cache for recommendations with TTL (24 hours)
const recommendationsCache = new Map<string, {
  timestamp: number;
  recommendations: Book[];
}>();

// 24 hours in milliseconds
const CACHE_TTL = 24 * 60 * 60 * 1000;

/**
 * Get basic recommendations based on top-rated books
 * @param limit Maximum number of books to return
 * @param minRating Minimum rating threshold (default 4.0)
 * @param genres Optional array of genres to filter by
 * @returns Promise with recommended books
 */
export const getBasicRecommendations = async (
  limit: number = 10,
  minRating: number = 4.0,
  genres?: string[]
): Promise<Book[]> => {
  try {
    // Check if the top-rated books index exists
    if (!(await fileExists(TOP_RATED_BOOKS_PATH))) {
      throw new NotFoundError('Top-rated books index not found');
    }

    // Read the top-rated books index
    const indexData = await readFile(TOP_RATED_BOOKS_PATH, 'utf-8');
    const topRatedBooks: Book[] = JSON.parse(indexData);

    // Filter by minimum rating if specified
    let recommendations = topRatedBooks.filter(
      book => (book.averageRating || 0) >= minRating
    );

    // Filter by genres if specified
    if (genres && genres.length > 0) {
      recommendations = recommendations.filter(book => {
        if (!book.genres || book.genres.length === 0) return false;
        return book.genres.some(genre => genres.includes(genre));
      });
    }

    // Shuffle the array to add some randomness for equal ratings
    recommendations = shuffleArray(recommendations);

    // Apply diversity rules - ensure mix of genres if possible
    const diverseRecommendations = ensureGenreDiversity(recommendations);

    // Return limited number of results
    return diverseRecommendations.slice(0, limit);
  } catch (error) {
    console.error('Error getting basic recommendations:', error);
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new FileSystemError('Failed to get recommendations');
  }
};

/**
 * Get recommendations for a specific user
 * This is the main function that will be called by the controller
 * @param userId User ID or null for non-authenticated users
 * @param limit Maximum number of books to return
 * @param refresh Force refresh of recommendations
 * @returns Promise with recommended books for user
 */
export const getUserRecommendations = async (
  userId?: string | null,
  limit: number = 10,
  refresh: boolean = false
): Promise<Book[]> => {
  try {
    // If no user ID, return basic recommendations
    if (!userId) {
      return getBasicRecommendations(limit);
    }

    // Create cache key
    const cacheKey = `recommendations_${userId}`;

    // Check cache if not forcing refresh
    if (!refresh) {
      const cached = recommendationsCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        return cached.recommendations.slice(0, limit);
      }
    }
    
    // No valid cache, generate new recommendations using AI if available
    let recommendations: Book[] = [];
    
    // Try to get AI-powered recommendations first
    if (openaiService.isAvailable()) {
      try {
        // Get user data
        const user = await getUserData(userId);
        
        // Get user's reviews
        const userReviews = await getUserReviews(userId);
        
        // Get user's favorites
        const userFavorites = await getUserFavorites(userId);
        
        // Get all available books
        const availableBooks = await getAllBooks();
        
        // Get AI-powered recommendations
        recommendations = await openaiService.getPersonalizedRecommendations(
          user,
          userReviews,
          userFavorites,
          availableBooks,
          limit
        );
        
        console.log(`Generated AI recommendations for user ${userId}`);
      } catch (error) {
        console.error('Error getting AI recommendations, falling back to basic:', error);
        // Fall back to basic recommendations if AI fails
        recommendations = await getBasicRecommendations(limit);
      }
    } else {
      // OpenAI not available, use basic recommendations
      recommendations = await getBasicRecommendations(limit);
    }
    
    // Store in cache
    recommendationsCache.set(cacheKey, {
      timestamp: Date.now(),
      recommendations
    });
    
    return recommendations;
  } catch (error) {
    console.error(`Error getting recommendations for user ${userId}:`, error);
    if (error instanceof NotFoundError) {
      throw error;
    }
    // Fallback to basic recommendations if there's an error
    return getBasicRecommendations(limit);
  }
};

// Helper to clear the recommendations cache
export const clearRecommendationsCache = (userId?: string): void => {
  if (userId) {
    recommendationsCache.delete(`recommendations_${userId}`);
  } else {
    recommendationsCache.clear();
  }
};

// Helper function to shuffle an array (Fisher-Yates algorithm)
const shuffleArray = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

// Helper function to ensure genre diversity in recommendations
const ensureGenreDiversity = (books: Book[]): Book[] => {
  const result: Book[] = [];
  const genreCounts: Record<string, number> = {};
  
  // First pass - count genres
  books.forEach(book => {
    if (book.genres) {
      book.genres.forEach(genre => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      });
    }
  });
  
  // Get sorted list of genres (most common first)
  const sortedGenres = Object.keys(genreCounts).sort(
    (a, b) => genreCounts[b] - genreCounts[a]
  );
  
  // Second pass - select books ensuring genre diversity
  const seenBooks = new Set<string>();
  
  // First prioritize books with less common genres
  for (let i = sortedGenres.length - 1; i >= 0; i--) {
    const genre = sortedGenres[i];
    const booksWithGenre = books.filter(
      book => book.genres && book.genres.includes(genre) && !seenBooks.has(book.id)
    );
    
    booksWithGenre.forEach(book => {
      if (!seenBooks.has(book.id)) {
        result.push(book);
        seenBooks.add(book.id);
      }
    });
  }
  
  // Add any remaining books
  books.forEach(book => {
    if (!seenBooks.has(book.id)) {
      result.push(book);
      seenBooks.add(book.id);
    }
  });
  
  return result;
};

/**
 * Get user data by ID
 * @param userId User ID
 * @returns Promise with User object
 */
const getUserData = async (userId: string): Promise<User> => {
  try {
    const userFilePath = path.join(process.cwd(), 'data', 'users', `${userId}.json`);
    
    if (!(await fileExists(userFilePath))) {
      throw new NotFoundError(`User not found: ${userId}`);
    }
    
    const userData = await readFile(userFilePath, 'utf-8');
    return JSON.parse(userData);
  } catch (error) {
    console.error(`Error getting user data for ${userId}:`, error);
    throw error;
  }
};

/**
 * Get all books from the database
 * @returns Promise with array of Book objects
 */
const getAllBooks = async (): Promise<Book[]> => {
  try {
    const bookFiles = await readdir(BOOKS_DIR);
    const books: Book[] = [];
    
    for (const file of bookFiles) {
      if (file.endsWith('.json')) {
        const bookData = await readFile(path.join(BOOKS_DIR, file), 'utf-8');
        books.push(JSON.parse(bookData));
      }
    }
    
    return books;
  } catch (error) {
    console.error('Error getting all books:', error);
    throw new FileSystemError('Failed to read books data');
  }
};

/**
 * Get user's reviews
 * @param userId User ID
 * @returns Promise with array of Review objects
 */
const getUserReviews = async (userId: string): Promise<Review[]> => {
  try {
    const reviewsDir = path.join(process.cwd(), 'data', 'reviews');
    if (!(await fileExists(reviewsDir))) {
      return [];
    }
    
    const reviewFiles = await readdir(reviewsDir);
    const reviews: Review[] = [];
    
    for (const file of reviewFiles) {
      if (file.endsWith('.json')) {
        const reviewData = await readFile(path.join(reviewsDir, file), 'utf-8');
        const review = JSON.parse(reviewData);
        
        // Only include reviews by this user
        if (review.userId === userId) {
          reviews.push(review);
        }
      }
    }
    
    return reviews;
  } catch (error) {
    console.error(`Error getting reviews for user ${userId}:`, error);
    return []; // Return empty array on error
  }
};

/**
 * Get user's favorite books
 * @param userId User ID
 * @returns Promise with array of Book objects
 */
const getUserFavorites = async (userId: string): Promise<Book[]> => {
  try {
    const favoritesDir = path.join(process.cwd(), 'data', 'favorites');
    const userFavoritesPath = path.join(favoritesDir, `${userId}.json`);
    
    if (!(await fileExists(userFavoritesPath))) {
      return [];
    }
    
    const favoritesData = await readFile(userFavoritesPath, 'utf-8');
    const favorites = JSON.parse(favoritesData);
    
    // Get the full book objects for each favorite
    const books: Book[] = [];
    for (const bookId of favorites) {
      const bookPath = path.join(BOOKS_DIR, `${bookId}.json`);
      
      if (await fileExists(bookPath)) {
        const bookData = await readFile(bookPath, 'utf-8');
        books.push(JSON.parse(bookData));
      }
    }
    
    return books;
  } catch (error) {
    console.error(`Error getting favorites for user ${userId}:`, error);
    return []; // Return empty array on error
  }
};
