// src/routes/books.ts
import { Router } from 'express';
// Import controllers later when they're implemented
// import { booksController } from '../controllers/booksController';

const router = Router();

// Define routes
router.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'success',
    data: { message: 'Books API endpoint placeholder' },
    error: null
  });
});

// Export the router
export { router as booksRouter };
