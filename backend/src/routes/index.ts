// src/routes/index.ts
import { Router } from 'express';
import { booksRouter } from './books';
import { usersRouter } from './users';
import { reviewsRouter } from './reviews';
import { authRouter } from './auth';
import { dataRouter } from './data';
import { favoritesRouter } from './favorites';
import { recommendationsRouter } from './recommendations';
import { docsRouter } from './docs';

// Import enhanced routes for new API standards
import { enhancedApiRouter } from './api.enhanced';

const router = Router();

// Mount the routers for different resources
router.use('/auth', authRouter);
router.use('/books', booksRouter);
router.use('/users', usersRouter);
router.use('/reviews', reviewsRouter);
router.use('/data', dataRouter);
router.use('/favorites', favoritesRouter);
router.use('/recommendations', recommendationsRouter);
router.use('/docs', docsRouter);

// Enhanced API router (for new API standards)
router.use('/enhanced', enhancedApiRouter);

export { router as apiRouter };
