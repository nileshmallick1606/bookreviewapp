// src/routes/users.ts
import { Router } from 'express';
import { getUserByIdController, getProfileController, updateProfileController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Define routes
router.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'success',
    data: { message: 'Users API endpoint placeholder' },
    error: null
  });
});

// Get user by ID (public info)
router.get('/:id', getUserByIdController);

// Get user profile with statistics (requires auth to get full profile)
router.get('/:id/profile', authMiddleware, getProfileController);

// Update user profile (requires auth)
router.put('/:id/profile', authMiddleware, updateProfileController);

// Export the router
export { router as usersRouter };
