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

// Create a new review for a book (requires authentication)
router.post('/books/:bookId/reviews', authMiddleware, createReview);

// Get all reviews for a book
router.get('/books/:bookId/reviews', getBookReviews);

// Get all reviews by a user
router.get('/users/:userId/reviews', getUserReviews);

// Get a specific review
router.get('/reviews/:reviewId', getReview);

// Update a review (requires authentication)
router.put('/reviews/:reviewId', authMiddleware, updateReview);

// Delete a review (requires authentication)
router.delete('/reviews/:reviewId', authMiddleware, deleteReview);

// Toggle like on a review (requires authentication)
router.post('/reviews/:reviewId/like', authMiddleware, toggleLike);

// Add a comment to a review (requires authentication)
router.post('/reviews/:reviewId/comment', authMiddleware, addComment);

export default router;
