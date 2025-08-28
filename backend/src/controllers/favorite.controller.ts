// src/controllers/favorite.controller.ts
import { Request, Response } from 'express';
import { addFavoriteBook, removeFavoriteBook, getUserFavoriteBookIds } from '../services/favoriteService';
import { NotFoundError } from '../utils/errors';

/**
 * Get user's favorite books
 */
export const getFavoriteBooks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const favoriteBookIds = await getUserFavoriteBookIds(userId);
    
    res.status(200).json({
      status: 'success',
      data: favoriteBookIds,
      error: null
    });
  } catch (error) {
    console.error('Error getting favorite books:', error);
    res.status(500).json({
      status: 'error',
      error: { code: 500, message: 'Failed to get favorite books' },
      data: null
    });
  }
};

/**
 * Add a book to favorites
 */
export const addToFavorites = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { bookId } = req.body;
    
    // Only allow users to modify their own favorites
    if (userId !== req.user?.id) {
      res.status(403).json({
        status: 'error',
        error: { code: 403, message: 'You can only modify your own favorites' },
        data: null
      });
      return;
    }
    
    if (!bookId) {
      res.status(400).json({
        status: 'error',
        error: { code: 400, message: 'Book ID is required' },
        data: null
      });
      return;
    }
    
    const updatedFavorites = await addFavoriteBook(userId, bookId);
    
    res.status(200).json({
      status: 'success',
      data: updatedFavorites,
      error: null
    });
  } catch (error) {
    console.error('Error adding favorite book:', error);
    
    if (error instanceof NotFoundError) {
      res.status(404).json({
        status: 'error',
        error: { code: 404, message: error.message },
        data: null
      });
      return;
    }
    
    res.status(500).json({
      status: 'error',
      error: { code: 500, message: 'Failed to add favorite book' },
      data: null
    });
  }
};

/**
 * Remove a book from favorites
 */
export const removeFromFavorites = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, bookId } = req.params;
    
    // Only allow users to modify their own favorites
    if (userId !== req.user?.id) {
      res.status(403).json({
        status: 'error',
        error: { code: 403, message: 'You can only modify your own favorites' },
        data: null
      });
      return;
    }
    
    const updatedFavorites = await removeFavoriteBook(userId, bookId);
    
    res.status(200).json({
      status: 'success',
      data: updatedFavorites,
      error: null
    });
  } catch (error) {
    console.error('Error removing favorite book:', error);
    res.status(500).json({
      status: 'error',
      error: { code: 500, message: 'Failed to remove favorite book' },
      data: null
    });
  }
};
