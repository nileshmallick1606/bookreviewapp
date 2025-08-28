// src/routes/favorites.ts
import { Router } from 'express';
import { 
  getFavoriteBooks, 
  addToFavorites, 
  removeFromFavorites 
} from '../controllers/favorite.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Get user's favorite books
router.get('/users/:userId', getFavoriteBooks);

// Add a book to favorites (requires auth)
router.post('/users/:userId', authMiddleware, addToFavorites);

// Remove a book from favorites (requires auth)
router.delete('/users/:userId/books/:bookId', authMiddleware, removeFromFavorites);

// Export the router
export { router as favoritesRouter };
