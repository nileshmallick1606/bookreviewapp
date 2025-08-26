// src/routes/index.ts
import { Router } from 'express';
import { booksRouter } from './books';
import { usersRouter } from './users';
import { reviewsRouter } from './reviews';
import { authRouter } from './auth';

const router = Router();

// Mount the routers for different resources
router.use('/auth', authRouter);
router.use('/books', booksRouter);
router.use('/users', usersRouter);
router.use('/reviews', reviewsRouter);

export { router as apiRouter };
