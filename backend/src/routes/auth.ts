// src/routes/auth.ts
import { Router } from 'express';
import { register, login, logout } from '../controllers/authController';
import { 
  initiateGoogleAuth,
  googleAuthCallback,
  initiateFacebookAuth,
  facebookAuthCallback
} from '../controllers/socialAuthController';
import {
  requestPasswordReset,
  validatePasswordResetToken,
  resetPassword
} from '../controllers/passwordResetController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Public auth endpoints
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Social authentication endpoints
router.get('/google', initiateGoogleAuth);
router.get('/google/callback', googleAuthCallback);
router.get('/facebook', initiateFacebookAuth);
router.get('/facebook/callback', facebookAuthCallback);

// Password reset endpoints
router.post('/password-reset', requestPasswordReset);
router.get('/password-reset/:token', validatePasswordResetToken);
router.post('/password-reset/:token', resetPassword);

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
