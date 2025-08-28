// src/services/favoriteService.ts
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { FileSystemError, NotFoundError, AuthorizationError } from '../utils/errors';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const access = promisify(fs.access);

const BOOKS_DIR = path.join(process.cwd(), 'data', 'books');
const FAVORITES_DIR = path.join(process.cwd(), 'data', 'favorites');
const FAVORITES_INDEX_DIR = path.join(process.cwd(), 'data', 'indexes');
const USER_FAVORITES_INDEX_FILE = path.join(FAVORITES_INDEX_DIR, 'user-favorites-index.json');

// Ensure directories exist
const ensureDirectoriesExist = async (): Promise<void> => {
  try {
    await mkdir(FAVORITES_DIR, { recursive: true });
    await mkdir(FAVORITES_INDEX_DIR, { recursive: true });
    
    // Create user favorites index file if it doesn't exist
    try {
      await access(USER_FAVORITES_INDEX_FILE);
    } catch (error) {
      await writeFile(USER_FAVORITES_INDEX_FILE, JSON.stringify({}, null, 2));
    }
  } catch (error) {
    throw new FileSystemError('Failed to initialize favorites storage');
  }
};

/**
 * Get favorite book IDs for a user
 * @param userId User ID
 * @returns Array of book IDs
 */
export const getUserFavoriteBookIds = async (userId: string): Promise<string[]> => {
  try {
    await ensureDirectoriesExist();
    
    try {
      const data = await readFile(USER_FAVORITES_INDEX_FILE, 'utf8');
      const favoritesIndex = JSON.parse(data);
      return favoritesIndex[userId] || [];
    } catch (error) {
      console.error('Error reading favorites index:', error);
      return [];
    }
  } catch (error) {
    console.error('Error getting user favorite book IDs:', error);
    return [];
  }
};

/**
 * Update user favorites index
 * @param userId User ID
 * @param bookIds Array of book IDs
 */
const updateUserFavoritesIndex = async (userId: string, bookIds: string[]): Promise<void> => {
  try {
    await ensureDirectoriesExist();
    
    // Read current index
    let favoritesIndex: Record<string, string[]> = {};
    try {
      const data = await readFile(USER_FAVORITES_INDEX_FILE, 'utf8');
      favoritesIndex = JSON.parse(data);
    } catch (error) {
      // If file doesn't exist or is invalid, use empty object
      favoritesIndex = {};
    }
    
    // Update the user's favorites
    favoritesIndex[userId] = bookIds;
    
    // Write updated index back to file
    await writeFile(USER_FAVORITES_INDEX_FILE, JSON.stringify(favoritesIndex, null, 2));
  } catch (error) {
    console.error('Error updating favorites index:', error);
    throw new FileSystemError('Failed to update favorites index');
  }
};

/**
 * Add a book to user's favorites
 * @param userId User ID
 * @param bookId Book ID
 * @returns Updated list of favorite book IDs
 */
export const addFavoriteBook = async (userId: string, bookId: string): Promise<string[]> => {
  try {
    // Verify the book exists
    const bookPath = path.join(BOOKS_DIR, `${bookId}.json`);
    try {
      await access(bookPath);
    } catch (error) {
      throw new NotFoundError('Book not found');
    }
    
    // Get current favorites
    const favorites = await getUserFavoriteBookIds(userId);
    
    // If book is already in favorites, just return the list
    if (favorites.includes(bookId)) {
      return favorites;
    }
    
    // Add book to favorites
    const updatedFavorites = [...favorites, bookId];
    await updateUserFavoritesIndex(userId, updatedFavorites);
    
    return updatedFavorites;
  } catch (error) {
    console.error('Error adding favorite book:', error);
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new FileSystemError('Failed to add favorite book');
  }
};

/**
 * Remove a book from user's favorites
 * @param userId User ID
 * @param bookId Book ID
 * @returns Updated list of favorite book IDs
 */
export const removeFavoriteBook = async (userId: string, bookId: string): Promise<string[]> => {
  try {
    // Get current favorites
    const favorites = await getUserFavoriteBookIds(userId);
    
    // If book is not in favorites, just return the list
    if (!favorites.includes(bookId)) {
      return favorites;
    }
    
    // Remove book from favorites
    const updatedFavorites = favorites.filter(id => id !== bookId);
    await updateUserFavoritesIndex(userId, updatedFavorites);
    
    return updatedFavorites;
  } catch (error) {
    console.error('Error removing favorite book:', error);
    throw new FileSystemError('Failed to remove favorite book');
  }
};
