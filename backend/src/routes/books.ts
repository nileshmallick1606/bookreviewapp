// src/routes/books.ts
import { Router } from 'express';
import { BookController } from '../controllers/bookController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { createReview, getBookReviews } from '../controllers/review.controller';

const router = Router();

// Public routes
router.get('/', BookController.getBooks);
router.get('/search', BookController.searchBooks);
router.get('/suggestions', BookController.getSuggestions);
router.get('/:id', BookController.getBookById);

// Import the upload middleware
import { reviewUpload } from '../middlewares/upload.middleware';

// Review routes
router.post('/:bookId/reviews', authMiddleware, reviewUpload, createReview);
router.get('/:bookId/reviews', getBookReviews);

// Admin routes (protected)
// Note: In a real implementation, we would also have an isAdmin middleware to check admin privileges
router.post('/', authMiddleware, BookController.createBook);
router.put('/:id', authMiddleware, BookController.updateBook);
router.delete('/:id', authMiddleware, BookController.deleteBook);

// Export the router
export { router as booksRouter };
