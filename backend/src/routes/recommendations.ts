// src/routes/recommendations.ts
import { Router } from 'express';
import { RecommendationController } from '../controllers/recommendationController';
import { optionalAuthMiddleware, authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Routes with optional authentication (to get personalized recommendations if logged in)
router.get('/', optionalAuthMiddleware, RecommendationController.getRecommendations);

// Routes that require authentication
router.get('/refresh', authMiddleware, RecommendationController.refreshRecommendations);

// Export the router
export { router as recommendationsRouter };
