// src/routes/api.enhanced.ts
import { Router } from 'express';
import { enhancedAuthRouter } from './enhancedAuth';
import { enhancedBooksRouter } from './enhancedBooks';
import { enhancedReviewsRouter } from './enhancedReviews';
import { docsRouter } from './docs';

/**
 * Enhanced API router with standardized controllers and Swagger documentation
 */
const router = Router();

/**
 * @swagger
 * components:
 *   responses:
 *     ValidationError:
 *       description: Validation failed for the request
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: error
 *               data:
 *                 type: null
 *                 example: null
 *               error:
 *                 type: object
 *                 properties:
 *                   code:
 *                     type: integer
 *                     example: 400
 *                   message:
 *                     type: string
 *                     example: Validation failed
 *                   errors:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         param:
 *                           type: string
 *                           example: email
 *                         message:
 *                           type: string
 *                           example: Email must be a valid email address
 *     NotFoundError:
 *       description: The requested resource was not found
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: error
 *               data:
 *                 type: null
 *                 example: null
 *               error:
 *                 type: object
 *                 properties:
 *                   code:
 *                     type: integer
 *                     example: 404
 *                   message:
 *                     type: string
 *                     example: Resource not found
 *     ServerError:
 *       description: An unexpected error occurred on the server
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: error
 *               data:
 *                 type: null
 *                 example: null
 *               error:
 *                 type: object
 *                 properties:
 *                   code:
 *                     type: integer
 *                     example: 500
 *                   message:
 *                     type: string
 *                     example: An unexpected error occurred
 *   schemas:
 *     PaginationMeta:
 *       type: object
 *       properties:
 *         currentPage:
 *           type: integer
 *           example: 1
 *         totalPages:
 *           type: integer
 *           example: 10
 *         pageSize:
 *           type: integer
 *           example: 10
 *         totalCount:
 *           type: integer
 *           example: 100
 *         links:
 *           type: object
 *           properties:
 *             first:
 *               type: string
 *               example: /api/v1/books?page=1&limit=10
 *             previous:
 *               type: string
 *               nullable: true
 *               example: null
 *             next:
 *               type: string
 *               example: /api/v1/books?page=2&limit=10
 *             last:
 *               type: string
 *               example: /api/v1/books?page=10&limit=10
 *     Book:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         author:
 *           type: string
 *         description:
 *           type: string
 *         publishedYear:
 *           type: integer
 *         genres:
 *           type: array
 *           items:
 *             type: string
 *         coverImage:
 *           type: string
 *           format: uri
 *         rating:
 *           type: number
 *           format: float
 *         reviewCount:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

// API Documentation
router.use('/docs', docsRouter);

// API Routes
router.use('/auth', enhancedAuthRouter);
router.use('/books', enhancedBooksRouter);
router.use('/reviews', enhancedReviewsRouter);

// Export the router
export { router as enhancedApiRouter };
