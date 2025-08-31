import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import { FileSystemError, NotFoundError } from '../utils/errors';
import { fileExists } from '../utils/file';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

// Directory where favorites will be stored
const FAVORITES_DIR = path.join(process.cwd(), 'data', 'favorites');
const USER_FAVORITES_DIR = path.join(FAVORITES_DIR, 'users');

/**
 * Ensure favorites directories exist
 */
const ensureDirectoriesExist = async (): Promise<void> => {
  try {
    await mkdir(FAVORITES_DIR, { recursive: true });
    await mkdir(USER_FAVORITES_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating favorites directories:', error);
    throw new FileSystemError('Failed to create favorites directories');
  }
};

/**
 * Get favorites for a user
 * @param userId User ID
 * @returns Array of book IDs
 */
export const getUserFavorites = async (userId: string): Promise<string[]> => {
  await ensureDirectoriesExist();
  
  const userFavoritesPath = path.join(USER_FAVORITES_DIR, `${userId}.json`);
  
  // If the file doesn't exist, the user has no favorites
  if (!(await fileExists(userFavoritesPath))) {
    return [];
  }
  
  try {
    const favoritesData = await readFile(userFavoritesPath, 'utf-8');
    return JSON.parse(favoritesData) as string[];
  } catch (error) {
    console.error('Error reading user favorites:', error);
    throw new FileSystemError('Failed to read user favorites');
  }
};

/**
 * Add a book to user's favorites
 * @param userId User ID
 * @param bookId Book ID
 * @returns Updated list of favorite book IDs
 */
export const addFavorite = async (userId: string, bookId: string): Promise<string[]> => {
  await ensureDirectoriesExist();
  
  const userFavoritesPath = path.join(USER_FAVORITES_DIR, `${userId}.json`);
  
  try {
    // Get current favorites or initialize empty array
    let favorites: string[] = [];
    if (await fileExists(userFavoritesPath)) {
      const favoritesData = await readFile(userFavoritesPath, 'utf-8');
      favorites = JSON.parse(favoritesData) as string[];
    }
    
    // Only add if not already in favorites
    if (!favorites.includes(bookId)) {
      favorites.push(bookId);
      await writeFile(userFavoritesPath, JSON.stringify(favorites, null, 2));
    }
    
    return favorites;
  } catch (error) {
    console.error('Error adding favorite:', error);
    throw new FileSystemError('Failed to add book to favorites');
  }
};

/**
 * Remove a book from user's favorites
 * @param userId User ID
 * @param bookId Book ID
 * @returns Updated list of favorite book IDs
 */
export const removeFavorite = async (userId: string, bookId: string): Promise<string[]> => {
  await ensureDirectoriesExist();
  
  const userFavoritesPath = path.join(USER_FAVORITES_DIR, `${userId}.json`);
  
  // If the file doesn't exist, the user has no favorites
  if (!(await fileExists(userFavoritesPath))) {
    return [];
  }
  
  try {
    const favoritesData = await readFile(userFavoritesPath, 'utf-8');
    let favorites = JSON.parse(favoritesData) as string[];
    
    // Filter out the book ID
    favorites = favorites.filter(id => id !== bookId);
    
    // Write updated favorites back to file
    await writeFile(userFavoritesPath, JSON.stringify(favorites, null, 2));
    
    return favorites;
  } catch (error) {
    console.error('Error removing favorite:', error);
    throw new FileSystemError('Failed to remove book from favorites');
  }
};

/**
 * Check if a book is in user's favorites
 * @param userId User ID
 * @param bookId Book ID
 * @returns Boolean indicating if book is favorited
 */
export const isBookFavorite = async (userId: string, bookId: string): Promise<boolean> => {
  const favorites = await getUserFavorites(userId);
  return favorites.includes(bookId);
};
