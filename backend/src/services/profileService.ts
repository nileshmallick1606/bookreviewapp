// src/services/profileService.ts
import fs from 'fs/promises';
import path from 'path';
import { getUserById } from './userService';
import { User } from '../models/user';

// Constants for file paths
const REVIEW_DATA_DIR = path.resolve(__dirname, '../../data/reviews');
const FAVORITE_INDEX_DIR = path.resolve(__dirname, '../../data/indexes');
const USER_FAVORITES_INDEX_FILE = path.resolve(FAVORITE_INDEX_DIR, 'user-favorites-index.json');

/**
 * Interface for profile statistics
 */
export interface ProfileStats {
  reviewCount: number;
  favoriteCount: number;
}

/**
 * Get the number of reviews by a user
 * @param userId User ID
 * @returns Number of reviews
 */
export const getUserReviewCount = async (userId: string): Promise<number> => {
  try {
    // Ensure the reviews directory exists
    try {
      await fs.access(REVIEW_DATA_DIR);
    } catch {
      await fs.mkdir(REVIEW_DATA_DIR, { recursive: true });
      return 0;
    }
    
    // List all review files
    const files = await fs.readdir(REVIEW_DATA_DIR);
    
    // Count reviews that belong to the user
    let count = 0;
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      
      try {
        const data = await fs.readFile(path.join(REVIEW_DATA_DIR, file), 'utf-8');
        const review = JSON.parse(data);
        
        if (review.userId === userId) {
          count++;
        }
      } catch (error) {
        // Skip files that can't be read or parsed
        console.error(`Error reading review file ${file}:`, error);
      }
    }
    
    return count;
  } catch (error) {
    console.error('Error getting user review count:', error);
    return 0;
  }
};

/**
 * Get the number of favorites for a user
 * @param userId User ID
 * @returns Number of favorite books
 */
export const getUserFavoriteCount = async (userId: string): Promise<number> => {
  try {
    // Ensure the index directory exists
    try {
      await fs.access(USER_FAVORITES_INDEX_FILE);
    } catch {
      await fs.mkdir(FAVORITE_INDEX_DIR, { recursive: true });
      await fs.writeFile(USER_FAVORITES_INDEX_FILE, JSON.stringify({}, null, 2));
      return 0;
    }
    
    // Read the favorites index
    const data = await fs.readFile(USER_FAVORITES_INDEX_FILE, 'utf-8');
    const favoritesIndex = JSON.parse(data);
    
    // Get favorites for the user
    const userFavorites = favoritesIndex[userId] || [];
    
    return userFavorites.length;
  } catch (error) {
    console.error('Error getting user favorite count:', error);
    return 0;
  }
};

/**
 * Get user profile with statistics
 * @param userId User ID
 * @returns User profile with statistics
 */
export const getUserProfile = async (userId: string): Promise<{
  user: User | null;
  stats: ProfileStats;
}> => {
  try {
    // Get the user data
    const user = await getUserById(userId);
    
    if (!user) {
      return {
        user: null,
        stats: { reviewCount: 0, favoriteCount: 0 }
      };
    }
    
    // Get the user statistics
    const [reviewCount, favoriteCount] = await Promise.all([
      getUserReviewCount(userId),
      getUserFavoriteCount(userId)
    ]);
    
    return {
      user,
      stats: {
        reviewCount,
        favoriteCount
      }
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw new Error('Failed to get user profile');
  }
};
