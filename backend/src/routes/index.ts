// src/routes/index.ts
import { Router } from 'express';
import { booksRouter } from './books';
import { usersRouter } from './users';
import { reviewsRouter } from './reviews';
import { authRouter } from './auth';
import { dataRouter } from './data';
import { favoritesRouter } from './favorites';
import { recommendationsRouter } from './recommendations';

const router = Router();

// Mount the routers for different resources
router.use('/auth', authRouter);
router.use('/books', booksRouter);
router.use('/users', usersRouter);
router.use('/reviews', reviewsRouter);
router.use('/data', dataRouter);
router.use('/favorites', favoritesRouter);
router.use('/recommendations', recommendationsRouter);

export { router as apiRouter };
