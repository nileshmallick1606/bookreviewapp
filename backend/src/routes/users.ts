// src/routes/users.ts
import { Router } from 'express';
// Import controllers later when they're implemented
// import { usersController } from '../controllers/usersController';

const router = Router();

// Define routes
router.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'success',
    data: { message: 'Users API endpoint placeholder' },
    error: null
  });
});

// Export the router
export { router as usersRouter };
