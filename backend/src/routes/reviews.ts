// src/routes/reviews.ts
import { Router } from 'express';
import {
  createReview,
  getReview,
  getBookReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  toggleLike,
  addComment
} from '../controllers/review.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Book reviews endpoints - for backward compatibility
router.get('/books/:bookId', getBookReviews);  // Handles /api/v1/reviews/books/:bookId

// User reviews endpoints
router.get('/users/:userId', getUserReviews);  // Handles /api/v1/reviews/users/:userId

// Review endpoints
router.get('/:reviewId', getReview);
router.put('/:reviewId', authMiddleware, updateReview);
router.delete('/:reviewId', authMiddleware, deleteReview);

// Like and comment endpoints
router.post('/:reviewId/like', authMiddleware, toggleLike);
router.post('/:reviewId/comment', authMiddleware, addComment);

// Export the router
export { router as reviewsRouter };
