// src/routes/enhancedReviews.ts
import { Router } from 'express';
import { EnhancedReviewController, reviewValidation } from '../controllers/enhancedReviewController';
import { authenticate } from '../middlewares/auth.enhanced';
import { validate } from '../middlewares/validation.middleware';
import { reviewUpload } from '../middlewares/upload.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Book review endpoints
 * 
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         bookId:
 *           type: string
 *           format: uuid
 *         text:
 *           type: string
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         images:
 *           type: array
 *           items:
 *             type: string
 *         likes:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             username:
 *               type: string
 *             fullName:
 *               type: string
 *     PaginatedReviews:
 *       type: object
 *       properties:
 *         reviews:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Review'
 *         total:
 *           type: integer
 */

// The individual review routes are primarily handled within the book routes
// This router handles standalone review operations

/**
 * @swagger
 * /reviews/{reviewId}:
 *   get:
 *     summary: Get a review by ID
 *     description: Returns details for a specific review
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The review ID
 *     responses:
 *       200:
 *         description: Review details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     review:
 *                       $ref: '#/components/schemas/Review'
 *                 error:
 *                   type: null
 *                   example: null
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:reviewId', validate(reviewValidation.getReviewById), EnhancedReviewController.getReviewById);

/**
 * @swagger
 * /reviews/{reviewId}:
 *   put:
 *     summary: Update a review
 *     description: Updates an existing review (own reviews only)
 *     tags: [Reviews]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The review ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 example: This is my updated review...
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *     responses:
 *       200:
 *         description: Review updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     review:
 *                       $ref: '#/components/schemas/Review'
 *                 error:
 *                   type: null
 *                   example: null
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/:reviewId', authenticate(), validate(reviewValidation.updateReview), EnhancedReviewController.updateReview);

/**
 * @swagger
 * /reviews/{reviewId}:
 *   delete:
 *     summary: Delete a review
 *     description: Deletes an existing review (own reviews only)
 *     tags: [Reviews]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The review ID
 *     responses:
 *       204:
 *         description: Review deleted (no content)
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/:reviewId', authenticate(), validate(reviewValidation.deleteReview), EnhancedReviewController.deleteReview);

/**
 * @swagger
 * /reviews/{reviewId}/like:
 *   post:
 *     summary: Like a review
 *     description: Adds a like to a review
 *     tags: [Reviews]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The review ID
 *     responses:
 *       200:
 *         description: Review liked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Review liked successfully
 *                 error:
 *                   type: null
 *                   example: null
 *       400:
 *         description: Already liked or own review
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/:reviewId/like', authenticate(), validate(reviewValidation.likeReview), EnhancedReviewController.likeReview);

/**
 * @swagger
 * /reviews/{reviewId}/unlike:
 *   post:
 *     summary: Unlike a review
 *     description: Removes a like from a review
 *     tags: [Reviews]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The review ID
 *     responses:
 *       200:
 *         description: Review unliked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Review unliked successfully
 *                 error:
 *                   type: null
 *                   example: null
 *       400:
 *         description: Not previously liked
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/:reviewId/unlike', authenticate(), validate(reviewValidation.unlikeReview), EnhancedReviewController.unlikeReview);

/**
 * @swagger
 * /users/{userId}/reviews:
 *   get:
 *     summary: Get user's reviews
 *     description: Returns reviews written by a specific user
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The user ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: The page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of reviews per page (default 10)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, rating]
 *         description: Field to sort by (default createdAt)
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort direction (default desc)
 *     responses:
 *       200:
 *         description: User's reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/PaginatedReviews'
 *                 error:
 *                   type: null
 *                   example: null
 *                 meta:
 *                   type: object
 *                   properties:
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationMeta'
 *       404:
 *         description: User not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/users/:userId/reviews', validate(reviewValidation.getUserReviews), EnhancedReviewController.getUserReviews);

// Export the router
export { router as enhancedReviewsRouter };
