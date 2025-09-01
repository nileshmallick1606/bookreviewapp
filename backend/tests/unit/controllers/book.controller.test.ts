/**
 * Tests for Book Controller
 */

import { BookController } from '../../../src/controllers/bookController';
import * as bookModel from '../../../src/models/book';
import * as bookResponseUtils from '../../../src/utils/bookResponseUtils';
import { createMockRequest, createMockResponse } from '../../helpers/expressTestUtils';
import { generateMockBook } from '../../helpers/mockDataGenerators';
import {jest, describe, beforeEach, it, expect} from '@jest/globals';

// Mock the dependencies
jest.mock('../../../src/models/book');
jest.mock('../../../src/utils/bookResponseUtils');

// Import the Book interface directly
import { Book } from '../../../src/models/interfaces/book.interface';

// Add proper typing for mocked functions
type BookListResponse = {
  books: Book[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const mockedGetBooks = bookModel.BookModel.getBooks as jest.MockedFunction<typeof bookModel.BookModel.getBooks>;
const mockedPrepareBookArrayForResponse = bookResponseUtils.prepareBookArrayForResponse as jest.MockedFunction<typeof bookResponseUtils.prepareBookArrayForResponse>;

describe('Book Controller', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBooks', () => {
    it('should return paginated list of books with default pagination', async () => {
      // Mock data
      const mockBooks = [
        generateMockBook(),
        generateMockBook(),
        generateMockBook()
      ];
      
      const mockBookData = {
        books: mockBooks,
        total: 3,
        page: 1,
        limit: 10,
        totalPages: 1
      };
      
      // Mock model and utils response
      mockedGetBooks.mockResolvedValue(mockBookData as any);
      mockedPrepareBookArrayForResponse.mockReturnValue(mockBooks as any);
      
      // Setup request with no query params (default pagination)
      const req = createMockRequest();
      const res = createMockResponse();
      
      // Call the controller
      await BookController.getBooks(req as any, res as any);
      
      // Assertions
      expect(mockedGetBooks).toHaveBeenCalledWith(1, 10, 'title', 'asc');
      expect(mockedPrepareBookArrayForResponse).toHaveBeenCalledWith(mockBooks);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockBookData,
        error: null
      });
    });
    
    it('should return paginated list of books with custom pagination', async () => {
      // Mock data
      const mockBooks = [
        generateMockBook(),
        generateMockBook()
      ];
      
      const mockBookData = {
        books: mockBooks,
        total: 10,
        page: 2,
        limit: 2,
        totalPages: 5
      };
      
      // Mock model and utils response
      mockedGetBooks.mockResolvedValue(mockBookData as any);
      mockedPrepareBookArrayForResponse.mockReturnValue(mockBooks as any);
      
      // Setup request with custom query params
      const req = createMockRequest({
        query: {
          page: '2',
          limit: '2',
          sortBy: 'publishedYear',
          sortOrder: 'desc'
        }
      });
      const res = createMockResponse();
      
      // Call the controller
      await BookController.getBooks(req as any, res as any);
      
      // Assertions
      expect(mockedGetBooks).toHaveBeenCalledWith(2, 2, 'publishedYear', 'desc');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockBookData,
        error: null
      });
    });
    
    it('should return 400 for invalid pagination parameters', async () => {
      // Setup request with invalid query params
      const req = createMockRequest({
        query: {
          page: '0',
          limit: '-5'
        }
      });
      const res = createMockResponse();
      
      // Call the controller
      await BookController.getBooks(req as any, res as any);
      
      // Assertions
      expect(mockedGetBooks).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        error: {
          code: 400,
          message: 'Invalid pagination parameters'
        }
      });
    });
    
    it('should handle errors and return 500 status', async () => {
      // Mock error in model
      mockedGetBooks.mockRejectedValue(new Error('Database error'));
      
      // Setup request
      const req = createMockRequest();
      const res = createMockResponse();
      
      // Call the controller
      await BookController.getBooks(req as any, res as any);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        status: 'error'
      }));
    });
  });
});
