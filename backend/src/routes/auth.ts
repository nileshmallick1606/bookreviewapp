// src/routes/auth.ts
import { Router } from 'express';
import { register, login } from '../controllers/authController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Public auth endpoints
router.post('/register', register);
router.post('/login', login);

// Protected endpoint example - get current user
router.get('/me', authenticate, (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    },
    error: null
  });
});

// Export the router
export { router as authRouter };
