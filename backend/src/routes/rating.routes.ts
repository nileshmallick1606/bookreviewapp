import express from 'express';
import { getTopRatedBooks } from '../controllers/rating.controller';

const router = express.Router();

/**
 * @route GET /api/v1/books/top-rated
 * @desc Get top-rated books
 * @access Public
 */
router.get('/top-rated', getTopRatedBooks);

export default router;
