import { Request, Response } from 'express';
import { BookModel } from '../models/book';
import { prepareBookForResponse, prepareBookArrayForResponse } from '../utils/bookResponseUtils';
import { getTopRatedBooks } from './rating.controller';

/**
 * Controller for book-related endpoints
 */
export class BookController {
  /**
   * Get top rated books
   */
  static getTopRatedBooks = getTopRatedBooks;
  
  /**
   * Get a paginated list of books
   * @param req Express request object
   * @param res Express response object
   */
  static async getBooks(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sortBy = req.query.sortBy as string || 'title';
      const sortOrder = req.query.sortOrder as string || 'asc';

      // Validate pagination parameters
      if (page < 1 || limit < 1) {
        return res.status(400).json({
          status: 'error',
          error: { code: 400, message: 'Invalid pagination parameters' }
        });
      }

      const bookData = await BookModel.getBooks(page, limit, sortBy, sortOrder);
      
      // Clean the book data to remove reviewCount property
      const cleanBookData = {
        ...bookData,
        books: prepareBookArrayForResponse(bookData.books)
      };

      return res.status(200).json({
        status: 'success',
        data: cleanBookData,
        error: null
      });
    } catch (error) {
      console.error('Error in getBooks controller:', error);
      return res.status(500).json({
        status: 'error',
        data: null,
        error: { code: 500, message: 'Failed to fetch books' }
      });
    }
  }

  /**
   * Get a book by ID
   * @param req Express request object
   * @param res Express response object
   */
  static async getBookById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          status: 'error',
          error: { code: 400, message: 'Book ID is required' }
        });
      }

      const book = await BookModel.getBookById(id);

      if (!book) {
        return res.status(404).json({
          status: 'error',
          error: { code: 404, message: 'Book not found' }
        });
      }

      // Clean the book data to remove reviewCount property
      const cleanBook = prepareBookForResponse(book);
      
      return res.status(200).json({
        status: 'success',
        data: cleanBook,
        error: null
      });
    } catch (error) {
      console.error(`Error in getBookById controller:`, error);
      return res.status(500).json({
        status: 'error',
        data: null,
        error: { code: 500, message: 'Failed to fetch book details' }
      });
    }
  }

  /**
   * Search for books by title or author
   * @param req Express request object
   * @param res Express response object
   */
  static async searchBooks(req: Request, res: Response) {
    try {
      const query = req.query.q as string;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!query || query.trim() === '') {
        return res.status(400).json({
          status: 'error',
          error: { code: 400, message: 'Search query is required' }
        });
      }

      const books = await BookModel.searchBooks(query, limit);

      // Clean the book data to remove reviewCount property
      const cleanBooks = prepareBookArrayForResponse(books);
      
      return res.status(200).json({
        status: 'success',
        data: cleanBooks,
        error: null
      });
    } catch (error) {
      console.error('Error in searchBooks controller:', error);
      return res.status(500).json({
        status: 'error',
        data: null,
        error: { code: 500, message: 'Failed to search books' }
      });
    }
  }

  /**
   * Get autocomplete suggestions based on query
   * @param req Express request object
   * @param res Express response object
   */
  static async getSuggestions(req: Request, res: Response) {
    try {
      const query = req.query.q as string;
      const limit = parseInt(req.query.limit as string) || 5;

      if (!query || query.trim() === '') {
        return res.status(200).json({
          status: 'success',
          data: [],
          error: null
        });
      }

      const suggestions = await BookModel.getSuggestions(query, limit);

      return res.status(200).json({
        status: 'success',
        data: suggestions,
        error: null
      });
    } catch (error) {
      console.error('Error in getSuggestions controller:', error);
      return res.status(500).json({
        status: 'error',
        data: null,
        error: { code: 500, message: 'Failed to get suggestions' }
      });
    }
  }

  /**
   * Create a new book
   * @param req Express request object
   * @param res Express response object
   */
  static async createBook(req: Request, res: Response) {
    try {
      const { title, author, description, coverImage, genres, publishedYear } = req.body;

      // Validate required fields
      if (!title || !author) {
        return res.status(400).json({
          status: 'error',
          error: { code: 400, message: 'Title and author are required' }
        });
      }

      // Create book
      const newBook = await BookModel.createBook({
        title,
        author,
        description: description || '',
        coverImage: coverImage || '',
        genres: genres || [],
        publishedYear: publishedYear || new Date().getFullYear(),
      });

      // Clean the book data to remove reviewCount property
      const cleanBook = prepareBookForResponse(newBook);
      
      return res.status(201).json({
        status: 'success',
        data: cleanBook,
        error: null
      });
    } catch (error) {
      console.error('Error in createBook controller:', error);
      return res.status(500).json({
        status: 'error',
        data: null,
        error: { code: 500, message: 'Failed to create book' }
      });
    }
  }

  /**
   * Update an existing book
   * @param req Express request object
   * @param res Express response object
   */
  static async updateBook(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { title, author, description, coverImage, genres, publishedYear } = req.body;

      if (!id) {
        return res.status(400).json({
          status: 'error',
          error: { code: 400, message: 'Book ID is required' }
        });
      }

      // Update book
      const updatedBook = await BookModel.updateBook(id, {
        title,
        author,
        description,
        coverImage,
        genres,
        publishedYear
      });

      if (!updatedBook) {
        return res.status(404).json({
          status: 'error',
          error: { code: 404, message: 'Book not found' }
        });
      }

      // Clean the book data to remove reviewCount property
      const cleanBook = prepareBookForResponse(updatedBook);
      
      return res.status(200).json({
        status: 'success',
        data: cleanBook,
        error: null
      });
    } catch (error) {
      console.error(`Error in updateBook controller:`, error);
      return res.status(500).json({
        status: 'error',
        data: null,
        error: { code: 500, message: 'Failed to update book' }
      });
    }
  }

  /**
   * Delete a book
   * @param req Express request object
   * @param res Express response object
   */
  static async deleteBook(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          status: 'error',
          error: { code: 400, message: 'Book ID is required' }
        });
      }

      // Delete book
      const deleted = await BookModel.deleteBook(id);

      if (!deleted) {
        return res.status(404).json({
          status: 'error',
          error: { code: 404, message: 'Book not found' }
        });
      }

      return res.status(200).json({
        status: 'success',
        data: { message: 'Book deleted successfully' },
        error: null
      });
    } catch (error) {
      console.error(`Error in deleteBook controller:`, error);
      return res.status(500).json({
        status: 'error',
        data: null,
        error: { code: 500, message: 'Failed to delete book' }
      });
    }
  }
}
