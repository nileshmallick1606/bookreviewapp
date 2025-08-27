// src/routes/books.ts
import { Router } from 'express';
import { BookController } from '../controllers/bookController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Public routes
router.get('/', BookController.getBooks);
router.get('/search', BookController.searchBooks);
router.get('/suggestions', BookController.getSuggestions);
router.get('/:id', BookController.getBookById);

// Admin routes (protected)
// Note: In a real implementation, we would also have an isAdmin middleware to check admin privileges
router.post('/', authenticate, BookController.createBook);
router.put('/:id', authenticate, BookController.updateBook);
router.delete('/:id', authenticate, BookController.deleteBook);

// Export the router
export { router as booksRouter };
