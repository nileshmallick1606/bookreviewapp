// src/controllers/enhancedReviewController.fixed.ts
import { Request, Response, NextFunction } from 'express';
import { body, param, query } from 'express-validator';
import { BaseController } from './base.controller';
import { createPaginationMeta, HttpStatus, PaginationMeta } from '../config/apiStandards';

/**
 * Review validation rules
 */
export const reviewValidation = {
  createReview: [
    param('bookId').isUUID().withMessage('Invalid book ID'),
    body('text').isString().trim().notEmpty().withMessage('Review text is required'),
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be a number between 1 and 5'),
  ],
  updateReview: [
    param('reviewId').isUUID().withMessage('Invalid review ID'),
    body('text').isString().trim().notEmpty().withMessage('Review text is required').optional(),
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be a number between 1 and 5')
      .optional(),
  ],
  getReviews: [
    param('bookId').isUUID().withMessage('Invalid book ID'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('sortBy')
      .optional()
      .isIn(['createdAt', 'updatedAt', 'rating'])
      .withMessage('sortBy must be one of: createdAt, updatedAt, rating'),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('sortOrder must be either asc or desc'),
  ],
  getReviewById: [param('reviewId').isUUID().withMessage('Invalid review ID')],
  deleteReview: [param('reviewId').isUUID().withMessage('Invalid review ID')],
  likeReview: [param('reviewId').isUUID().withMessage('Invalid review ID')],
  unlikeReview: [param('reviewId').isUUID().withMessage('Invalid review ID')],
  getUserReviews: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('sortBy')
      .optional()
      .isIn(['createdAt', 'updatedAt', 'rating'])
      .withMessage('sortBy must be one of: createdAt, updatedAt, rating'),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('sortOrder must be either asc or desc'),
  ],
};

// Type definitions for request extensions
// We define Application interface to add services
declare global {
  namespace Express {
    // We don't redefine Request.user as it causes conflicts
    
    interface Application {
      services: {
        book: any;
        review: any;
        user: any;
      };
    }
  }
}

/**
 * Enhanced Review Controller with standardized responses
 */
export class EnhancedReviewController extends BaseController {
  /**
   * Create a new review
   */
  static async createReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { bookId } = req.params;
      const { text, rating } = req.body;
      
      // Ensure user is logged in
      if (!req.user) {
        return this.prototype.sendUnauthorized(res);
      }
      
      const userId = req.user.id;

      // Check if the book exists
      const bookService = req.app.services.book;
      const book = await bookService.getBookById(bookId);
      if (!book) {
        return this.prototype.sendNotFound(res, 'Book not found');
      }

      // Check if the user has already reviewed this book
      const reviewService = req.app.services.review;
      const existingReview = await reviewService.getUserReviewForBook(userId, bookId);
      if (existingReview) {
        return this.prototype.sendBadRequest(
          res, 
          'You have already reviewed this book. Please update your existing review.'
        );
      }

      // Create the review
      const reviewData = {
        userId,
        bookId,
        text,
        rating,
        images: req.files?.map((file: Express.Multer.File) => file.filename) || [],
      };

      const review = await reviewService.createReview(reviewData);

      // Update book rating
      await bookService.updateBookRating(bookId);

      return this.prototype.sendCreated(res, { review });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Update a review
   */
  static async updateReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { reviewId } = req.params;
      const updateData = req.body;
      
      // Ensure user is logged in
      if (!req.user) {
        return this.prototype.sendUnauthorized(res);
      }
      
      const userId = req.user.id;

      const reviewService = req.app.services.review;
      
      // Check if the review exists
      const review = await reviewService.getReviewById(reviewId);
      if (!review) {
        return this.prototype.sendNotFound(res, 'Review not found');
      }

      // Check if the user is the owner of the review
      if (review.userId !== userId) {
        return this.prototype.sendForbidden(
          res,
          'You can only update your own reviews'
        );
      }

      // Update the review
      const updatedReview = await reviewService.updateReview(reviewId, updateData);

      // Update book rating if rating was changed
      if (updateData.rating) {
        const bookService = req.app.services.book;
        await bookService.updateBookRating(review.bookId);
      }

      return this.prototype.sendSuccess(res, { review: updatedReview });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get reviews for a specific book
   */
  static async getBookReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const { bookId } = req.params;
      const page = req.query.page || '1';
      const limit = req.query.limit || '10';
      const sortBy = req.query.sortBy || 'createdAt';
      const sortOrder = req.query.sortOrder || 'desc';

      // Check if the book exists
      const bookService = req.app.services.book;
      const book = await bookService.getBookById(bookId);
      if (!book) {
        return this.prototype.sendNotFound(res, 'Book not found');
      }

      // Get reviews
      const reviewService = req.app.services.review;
      const { reviews, total, totalPages } = await reviewService.getBookReviews(
        bookId,
        {
          page: Number(page),
          limit: Number(limit),
          sortBy: sortBy as string,
          sortOrder: sortOrder as 'asc' | 'desc',
        }
      );

      // Format pagination metadata
      const pagination = this.prototype.createPagination(
        req,
        total,
        Number(limit)
      );

      return this.prototype.sendSuccess(
        res, 
        { 
          reviews,
          total 
        },
        HttpStatus.OK,
        { pagination }
      );
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get a specific review by ID
   */
  static async getReviewById(req: Request, res: Response, next: NextFunction) {
    try {
      const { reviewId } = req.params;
      
      const reviewService = req.app.services.review;
      const review = await reviewService.getReviewById(reviewId);
      
      if (!review) {
        return this.prototype.sendNotFound(res, 'Review not found');
      }
      
      return this.prototype.sendSuccess(res, { review });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Delete a review
   */
  static async deleteReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { reviewId } = req.params;
      
      // Ensure user is logged in
      if (!req.user) {
        return this.prototype.sendUnauthorized(res);
      }
      
      const userId = req.user.id;
      // Check if user has admin role (using any to bypass type checking)
      const isAdmin = (req.user as any).role === 'admin';
      
      const reviewService = req.app.services.review;
      
      // Check if review exists
      const review = await reviewService.getReviewById(reviewId);
      if (!review) {
        return this.prototype.sendNotFound(res, 'Review not found');
      }
      
      // Check if user is authorized to delete
      if (review.userId !== userId && !isAdmin) {
        return this.prototype.sendForbidden(
          res, 
          'You can only delete your own reviews'
        );
      }
      
      // Delete the review
      await reviewService.deleteReview(reviewId);
      
      // Update book rating
      const bookService = req.app.services.book;
      await bookService.updateBookRating(review.bookId);
      
      return this.prototype.sendNoContent(res);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Like a review
   */
  static async likeReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { reviewId } = req.params;
      
      // Ensure user is logged in
      if (!req.user) {
        return this.prototype.sendUnauthorized(res);
      }
      
      const userId = req.user.id;
      
      const reviewService = req.app.services.review;
      
      // Check if review exists
      const review = await reviewService.getReviewById(reviewId);
      if (!review) {
        return this.prototype.sendNotFound(res, 'Review not found');
      }
      
      // Like the review
      await reviewService.likeReview(reviewId, userId);
      
      return this.prototype.sendSuccess(res, { message: 'Review liked successfully' });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Unlike a review
   */
  static async unlikeReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { reviewId } = req.params;
      
      // Ensure user is logged in
      if (!req.user) {
        return this.prototype.sendUnauthorized(res);
      }
      
      const userId = req.user.id;
      
      const reviewService = req.app.services.review;
      
      // Check if review exists
      const review = await reviewService.getReviewById(reviewId);
      if (!review) {
        return this.prototype.sendNotFound(res, 'Review not found');
      }
      
      // Unlike the review
      await reviewService.unlikeReview(reviewId, userId);
      
      return this.prototype.sendSuccess(res, { message: 'Review unliked successfully' });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get reviews by the current user
   */
  static async getUserReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page || '1';
      const limit = req.query.limit || '10';
      const sortBy = req.query.sortBy || 'createdAt';
      const sortOrder = req.query.sortOrder || 'desc';
      
      // Ensure user is logged in
      if (!req.user) {
        return this.prototype.sendUnauthorized(res);
      }
      
      const userId = req.user.id;
      
      // Get user's reviews
      const reviewService = req.app.services.review;
      const { reviews, total, totalPages } = await reviewService.getUserReviews(
        userId,
        {
          page: Number(page),
          limit: Number(limit),
          sortBy: sortBy as string,
          sortOrder: sortOrder as 'asc' | 'desc',
        }
      );

      // Format pagination metadata
      const pagination = this.prototype.createPagination(
        req,
        total,
        Number(limit)
      );

      return this.prototype.sendSuccess(
        res, 
        { 
          reviews,
          total 
        },
        HttpStatus.OK,
        { pagination }
      );
    } catch (error) {
      return next(error);
    }
  }
}
