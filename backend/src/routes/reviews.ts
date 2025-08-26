// src/routes/reviews.ts
import { Router } from 'express';
// Import controllers later when they're implemented
// import { reviewsController } from '../controllers/reviewsController';

const router = Router();

// Define routes
router.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'success',
    data: { message: 'Reviews API endpoint placeholder' },
    error: null
  });
});

// Export the router
export { router as reviewsRouter };
