import { Request, Response, NextFunction } from 'express';
import { BookModel } from '../models/book';
import { prepareBookForResponse, prepareBookArrayForResponse } from '../utils/bookResponseUtils';
import { getTopRatedBooks } from './rating.controller';
import { BaseController } from './base.controller';
import { ApiError } from '../middlewares/error.middleware';
import { HttpStatus } from '../config/apiStandards';
import { body, param, query } from 'express-validator';

/**
 * Controller for book-related endpoints
 * Extends BaseController to use standardized responses
 */
export class EnhancedBookController extends BaseController {
  /**
   * Get top rated books
   */
  static getTopRatedBooks = getTopRatedBooks;
  
  /**
   * Get a paginated list of books
   * @param req Express request object
   * @param res Express response object
   * @param next Express next function
   */
  static async getBooks(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sortBy = req.query.sortBy as string || 'title';
      const sortOrder = req.query.sortOrder as string || 'asc';

      // Validate pagination parameters
      if (page < 1 || limit < 1) {
        return this.prototype.sendBadRequest(res, 'Invalid pagination parameters');
      }

      const bookData = await BookModel.getBooks(page, limit, sortBy, sortOrder);
      
      // Clean the book data to remove deprecated properties
      const cleanBookData = {
        ...bookData,
        books: prepareBookArrayForResponse(bookData.books)
      };

      // Create pagination metadata
      const pagination = this.prototype.createPagination(req, bookData.total, limit);

      // Send success response with pagination metadata
      return this.prototype.sendSuccess(res, cleanBookData, HttpStatus.OK, { pagination });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a specific book by ID
   * @param req Express request object
   * @param res Express response object
   * @param next Express next function
   */
  static async getBookById(req: Request, res: Response, next: NextFunction) {
    try {
      const bookId = req.params.id;
      const book = await BookModel.getBookById(bookId);
      
      if (!book) {
        throw new ApiError(HttpStatus.NOT_FOUND, `Book with ID ${bookId} not found`);
      }
      
      // Clean the book data to remove deprecated properties
      const cleanBook = prepareBookForResponse(book);
      
      return this.prototype.sendSuccess(res, cleanBook);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search for books
   * @param req Express request object
   * @param res Express response object
   * @param next Express next function
   */
  static async searchBooks(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query.q as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      if (!query) {
        return this.prototype.sendBadRequest(res, 'Search query is required');
      }
      
      // Search books only accepts query and limit, not page
      const books = await BookModel.searchBooks(query, limit);
      
      // Get total count of matching books
      const total = books.length;
      
      // Apply pagination manually
      const startIndex = (page - 1) * limit;
      const paginatedBooks = books.slice(startIndex, Math.min(startIndex + limit, books.length));
      
      // Clean the book data to remove deprecated properties
      const cleanResults = {
        books: prepareBookArrayForResponse(paginatedBooks),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
      
      // Create pagination metadata
      const pagination = this.prototype.createPagination(req, total, limit);
      
      return this.prototype.sendSuccess(res, cleanResults, HttpStatus.OK, { pagination });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get book suggestions based on query
   * @param req Express request object
   * @param res Express response object
   * @param next Express next function
   */
  static async getSuggestions(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query.q as string;
      const limit = parseInt(req.query.limit as string) || 5;
      
      if (!query) {
        return this.prototype.sendBadRequest(res, 'Search query is required');
      }
      
      const suggestions = await BookModel.getSuggestions(query, limit);
      
      return this.prototype.sendSuccess(res, { suggestions });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new book (admin only)
   * @param req Express request object
   * @param res Express response object
   * @param next Express next function
   */
  static async createBook(req: Request, res: Response, next: NextFunction) {
    try {
      const bookData = req.body;
      
      // Validate required fields
      if (!bookData.title || !bookData.author) {
        return this.prototype.sendBadRequest(res, 'Title and author are required');
      }
      
      const newBook = await BookModel.createBook(bookData);
      const cleanBook = prepareBookForResponse(newBook);
      
      return this.prototype.sendCreated(res, cleanBook);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update an existing book (admin only)
   * @param req Express request object
   * @param res Express response object
   * @param next Express next function
   */
  static async updateBook(req: Request, res: Response, next: NextFunction) {
    try {
      const bookId = req.params.id;
      const bookData = req.body;
      
      // Check if book exists
      const existingBook = await BookModel.getBookById(bookId);
      if (!existingBook) {
        throw new ApiError(HttpStatus.NOT_FOUND, `Book with ID ${bookId} not found`);
      }
      
      const updatedBook = await BookModel.updateBook(bookId, bookData);
      
      // Handle case where updateBook returns null
      if (!updatedBook) {
        throw new ApiError(HttpStatus.NOT_FOUND, `Failed to update book with ID ${bookId}`);
      }
      
      const cleanBook = prepareBookForResponse(updatedBook);
      
      return this.prototype.sendSuccess(res, cleanBook);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a book (admin only)
   * @param req Express request object
   * @param res Express response object
   * @param next Express next function
   */
  static async deleteBook(req: Request, res: Response, next: NextFunction) {
    try {
      const bookId = req.params.id;
      
      // Check if book exists
      const existingBook = await BookModel.getBookById(bookId);
      if (!existingBook) {
        throw new ApiError(HttpStatus.NOT_FOUND, `Book with ID ${bookId} not found`);
      }
      
      await BookModel.deleteBook(bookId);
      
      return this.prototype.sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }
}

// Define validation rules for book endpoints
export const bookValidation = {
  getBooks: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('sortBy').optional().isString().withMessage('Sort field must be a string'),
    query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
  ],
  
  getBookById: [
    param('id').isUUID().withMessage('Invalid book ID format')
  ],
  
  searchBooks: [
    query('q').notEmpty().withMessage('Search query is required'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  
  createBook: [
    body('title').notEmpty().withMessage('Title is required'),
    body('author').notEmpty().withMessage('Author is required'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('publishedYear').optional().isInt({ min: 1000, max: new Date().getFullYear() })
      .withMessage(`Published year must be between 1000 and ${new Date().getFullYear()}`),
    body('genres').optional().isArray().withMessage('Genres must be an array'),
    body('coverImage').optional().isURL().withMessage('Cover image must be a valid URL')
  ],
  
  updateBook: [
    param('id').isUUID().withMessage('Invalid book ID format'),
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('author').optional().notEmpty().withMessage('Author cannot be empty'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('publishedYear').optional().isInt({ min: 1000, max: new Date().getFullYear() })
      .withMessage(`Published year must be between 1000 and ${new Date().getFullYear()}`),
    body('genres').optional().isArray().withMessage('Genres must be an array'),
    body('coverImage').optional().isURL().withMessage('Cover image must be a valid URL')
  ]
};
