// src/routes/users.ts
import { Router } from 'express';
import { getUserByIdController } from '../controllers/user.controller';

const router = Router();

// Define routes
router.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'success',
    data: { message: 'Users API endpoint placeholder' },
    error: null
  });
});

// Get user by ID
router.get('/:id', getUserByIdController);

// Export the router
export { router as usersRouter };
