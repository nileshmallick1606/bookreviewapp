// src/services/favoriteService.ts
import api from './api';

/**
 * Get a user's favorite books
 * @param userId User ID
 * @returns Array of book IDs
 */
export const getFavoriteBooks = async (userId: string): Promise<string[]> => {
  try {
    const response = await api.get(`/favorites/users/${userId}`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching favorite books:', error);
    return [];
  }
};

/**
 * Add a book to user's favorites
 * @param userId User ID
 * @param bookId Book ID
 * @returns Updated array of favorite book IDs
 */
export const addToFavorites = async (userId: string, bookId: string): Promise<string[]> => {
  try {
    const response = await api.post(`/favorites/users/${userId}`, { bookId });
    return response.data.data;
  } catch (error) {
    console.error('Error adding book to favorites:', error);
    throw error;
  }
};

/**
 * Remove a book from user's favorites
 * @param userId User ID
 * @param bookId Book ID
 * @returns Updated array of favorite book IDs
 */
export const removeFromFavorites = async (userId: string, bookId: string): Promise<string[]> => {
  try {
    const response = await api.delete(`/favorites/users/${userId}/books/${bookId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error removing book from favorites:', error);
    throw error;
  }
};
