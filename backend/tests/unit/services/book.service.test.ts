/**
 * Unit tests for Book Model and Book Service
 */

import { BookModel } from '../../../src/models/book';
import * as bookService from '../../../src/services/book/book.service';
import * as reviewService from '../../../src/services/review/review.service';
import { generateMockBook } from '../../helpers/mockDataGenerators';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { setupFileMocks, resetMockFileSystem, addMockFile } from '../../helpers/fileSystemMocks';
import * as fileUtils from '../../../src/utils/file';
import {jest, describe, beforeEach, it, beforeAll, expect} from '@jest/globals';

// Mock path for consistent test paths
jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/'))
}));

describe('Book Model and Service Tests', () => {
  beforeAll(() => {
    setupFileMocks();
  });
  
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    resetMockFileSystem();
  });

  describe('Book Model - getBookById', () => {
    it('should return a book when it exists', async () => {
      // Create a mock book
      const mockBook = generateMockBook();
      
      // Setup mock book file paths
      const bookPath = path.join(process.cwd(), 'data', 'books', `${mockBook.id}.json`);
      
      // More direct approach: mock both existsSync and fs.promises.readFile
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      
      // Mock the fs.promises.readFile specifically for this test
      const originalReadFile = fs.promises.readFile;
      fs.promises.readFile = jest.fn().mockImplementation((filePath: any, encoding) => {
        if (filePath.toString().includes(mockBook.id)) {
          return Promise.resolve(JSON.stringify(mockBook));
        }
        return Promise.reject(new Error(`File not found: ${filePath}`));
      }) as any;
      
      // Call model method
      const result = await BookModel.getBookById(mockBook.id);
      
      // Restore original readFile
      fs.promises.readFile = originalReadFile;
      
      // Assertions
      expect(result).toEqual(mockBook);
    });
    
    it('should return null when book does not exist', async () => {
      // Call model method with a non-existent ID
      const nonExistentId = uuidv4();
      
      // Mock fs.existsSync to return false for this ID
      jest.spyOn(fs, 'existsSync').mockReturnValue(false);
      
      const result = await BookModel.getBookById(nonExistentId);
      
      // Assertions
      expect(result).toBeNull();
    });
  });
  
  describe('Book Model - getBooks', () => {
    it('should return paginated list of books', async () => {
      // Create mock books
      const mockBooks = [
        generateMockBook({ title: 'Book A' }),
        generateMockBook({ title: 'Book B' }),
        generateMockBook({ title: 'Book C' })
      ];
      
      // Mock fs.readdirSync to return only our mock book filenames
      jest.spyOn(fs, 'readdirSync').mockReturnValue(
        mockBooks.map(book => `${book.id}.json`) as any
      );
      
      // Mock fs.promises.readFile to return our mock book data
      const originalReadFile = fs.promises.readFile;
      fs.promises.readFile = jest.fn().mockImplementation((filePath: any, encoding) => {
        const bookId = filePath.toString().split('/').pop().replace('.json', '');
        const mockBook = mockBooks.find(book => book.id === bookId);
        
        if (mockBook) {
          return Promise.resolve(JSON.stringify(mockBook));
        }
        return Promise.reject(new Error(`File not found: ${filePath}`));
      }) as any;
      
      // Mock fs.existsSync for directory check
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      
      // Call model method
      const result = await BookModel.getBooks(1, 10, 'title', 'asc');
      
      // Restore original readFile
      fs.promises.readFile = originalReadFile;
      
      // Assertions
      expect(result.books).toHaveLength(mockBooks.length);
      expect(result.total).toBe(mockBooks.length);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
    
    it('should sort books correctly', async () => {
      // Create mock books
      const mockBooks = [
        generateMockBook({ title: 'C Book', publishedYear: 2020 }),
        generateMockBook({ title: 'A Book', publishedYear: 2022 }),
        generateMockBook({ title: 'B Book', publishedYear: 2021 })
      ];
      
      // Mock fs.readdirSync to return only our mock book filenames
      jest.spyOn(fs, 'readdirSync').mockReturnValue(
        mockBooks.map(book => `${book.id}.json`) as any
      );
      
      // Mock fs.promises.readFile to return our mock book data
      const originalReadFile = fs.promises.readFile;
      fs.promises.readFile = jest.fn().mockImplementation((filePath: any, encoding) => {
        const bookId = filePath.toString().split('/').pop().replace('.json', '');
        const mockBook = mockBooks.find(book => book.id === bookId);
        
        if (mockBook) {
          return Promise.resolve(JSON.stringify(mockBook));
        }
        return Promise.reject(new Error(`File not found: ${filePath}`));
      }) as any;
      
      // Mock fs.existsSync for directory check
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      
      // Call model method with publishedYear desc sorting
      const result = await BookModel.getBooks(1, 10, 'publishedYear', 'desc');
      
      // Restore original readFile
      fs.promises.readFile = originalReadFile;
      
      // Assertions
      expect(result.books).toHaveLength(3);
      expect(result.books[0].publishedYear).toBeGreaterThanOrEqual(result.books[1].publishedYear);
      expect(result.books[1].publishedYear).toBeGreaterThanOrEqual(result.books[2].publishedYear);
    });
    
    it('should apply pagination correctly', async () => {
      // Create mock books
      const mockBooks = Array.from({ length: 15 }, (_, i) => 
        generateMockBook({ title: `Book ${String.fromCharCode(65 + i)}` }) // Book A, Book B, etc.
      );
      
      // Mock fs.readdirSync to return only our mock book filenames
      jest.spyOn(fs, 'readdirSync').mockReturnValue(
        mockBooks.map(book => `${book.id}.json`) as any
      );
      
      // Mock fs.promises.readFile to return our mock book data
      const originalReadFile = fs.promises.readFile;
      fs.promises.readFile = jest.fn().mockImplementation((filePath: any, encoding) => {
        const bookId = filePath.toString().split('/').pop().replace('.json', '');
        const mockBook = mockBooks.find(book => book.id === bookId);
        
        if (mockBook) {
          return Promise.resolve(JSON.stringify(mockBook));
        }
        return Promise.reject(new Error(`File not found: ${filePath}`));
      }) as any;
      
      // Mock fs.existsSync for directory check
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      
      // Call model method with page 2, limit 5
      const result = await BookModel.getBooks(2, 5, 'title', 'asc');
      
      // Restore original readFile
      fs.promises.readFile = originalReadFile;
      
      // Assertions
      expect(result.books).toHaveLength(5);
      expect(result.total).toBe(15);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(5);
      expect(result.totalPages).toBe(3);
    });
  });
  
  describe('Book Model - searchBooks', () => {
    it('should find books matching search query', async () => {
      // Create mock books
      const mockBooks = [
        generateMockBook({ title: 'Harry Potter and the Goblet of Fire', author: 'J.K. Rowling' }),
        generateMockBook({ title: 'The Lord of the Rings', author: 'J.R.R. Tolkien' }),
        generateMockBook({ title: 'Harry Potter and the Order of Phoenix', author: 'J.K. Rowling' })
      ];
      
      // Mock fs.readdirSync to return only our mock book filenames
      jest.spyOn(fs, 'readdirSync').mockReturnValue(
        mockBooks.map(book => `${book.id}.json`) as any
      );
      
      // Mock fs.promises.readFile to return our mock book data
      const originalReadFile = fs.promises.readFile;
      fs.promises.readFile = jest.fn().mockImplementation((filePath: any, encoding) => {
        const bookId = filePath.toString().split('/').pop().replace('.json', '');
        const mockBook = mockBooks.find(book => book.id === bookId);
        
        if (mockBook) {
          return Promise.resolve(JSON.stringify(mockBook));
        }
        return Promise.reject(new Error(`File not found: ${filePath}`));
      }) as any;
      
      // Mock fs.existsSync for directory check
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      
      // Call model method to search for Harry Potter books
      const result = await BookModel.searchBooks('Harry Potter', 10);
      
      // Restore original readFile
      fs.promises.readFile = originalReadFile;
      
      // Assertions
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(book => 
        book.title.toLowerCase().includes('harry potter') || 
        book.author.toLowerCase().includes('harry potter')
      )).toBe(true);
    });
  });
  
  describe('Book Service - calculateAverageRating', () => {
    it('should calculate average rating from book reviews', async () => {
      // Create mock book
      const mockBookId = uuidv4();
      
      // Create mock reviews with ratings - adding required fields for Review type
      const mockReviews = [
        { id: uuidv4(), bookId: mockBookId, userId: 'user1', rating: 5, text: 'Great book', likes: 0, comments: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: uuidv4(), bookId: mockBookId, userId: 'user2', rating: 4, text: 'Good book', likes: 0, comments: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: uuidv4(), bookId: mockBookId, userId: 'user3', rating: 3, text: 'Average book', likes: 0, comments: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ];
      
      // Create mock book
      const mockBook = generateMockBook({ id: mockBookId });
      
      // Setup environment for testing
      process.env.NODE_ENV = 'test';
      
      // Mock the directory check
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      
      // Mock the fileExists function
      jest.spyOn(fileUtils, 'fileExists').mockImplementation(async () => true);
      
      // Mock the getReviewsByBook function directly
      jest.spyOn(reviewService, 'getReviewsByBook').mockImplementation(async () => mockReviews as any);
      
      // Mock readFile for the book data
      const originalReadFile = fs.promises.readFile;
      const mockReadFile = jest.fn().mockImplementation(() => Promise.resolve(JSON.stringify(mockBook)));
      fs.promises.readFile = mockReadFile as any;
      
      // Mock writeFile to prevent actual file writes
      const originalWriteFile = fs.promises.writeFile;
      const mockWriteFile = jest.fn().mockImplementation(() => Promise.resolve());
      fs.promises.writeFile = mockWriteFile as any;
      
      // Mock updateTopRatedBooksIndex to prevent it from running
      jest.spyOn(bookService, 'updateTopRatedBooksIndex').mockImplementation(async () => {});
      
      // Mock all other potential error sources
      jest.spyOn(console, 'error').mockImplementation(() => {});
      jest.spyOn(console, 'log').mockImplementation(() => {});
      
      // Call service method
      const averageRating = await bookService.calculateAverageRating(mockBookId);
      
      // Restore original functions
      jest.spyOn(fileUtils, 'fileExists').mockRestore();
      jest.spyOn(reviewService, 'getReviewsByBook').mockRestore();
      jest.spyOn(bookService, 'updateTopRatedBooksIndex').mockRestore();
      fs.promises.readFile = originalReadFile;
      fs.promises.writeFile = originalWriteFile;
      
      // Assertions - Expected average: (5 + 4 + 3) / 3 = 4
      expect(averageRating).toBe(4);
    });
    
    it('should return null when book has no reviews', async () => {
      // Create mock book with no reviews
      const mockBookId = uuidv4();
      const mockBook = generateMockBook({ id: mockBookId });
      
      // Setup environment for testing
      process.env.NODE_ENV = 'test';
      
      // Mock the directory check
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      
      // Mock the fileExists function
      jest.spyOn(fileUtils, 'fileExists').mockImplementation(async () => true);
      
      // Mock the getReviewsByBook function to return empty array
      jest.spyOn(reviewService, 'getReviewsByBook').mockImplementation(async () => []);
      
      // Mock readFile for the book data
      const originalReadFile = fs.promises.readFile;
      const mockReadFile = jest.fn().mockImplementation(() => Promise.resolve(JSON.stringify(mockBook)));
      fs.promises.readFile = mockReadFile as any;
      
      // Mock writeFile to prevent actual file writes
      const originalWriteFile = fs.promises.writeFile;
      const mockWriteFile = jest.fn().mockImplementation(() => Promise.resolve());
      fs.promises.writeFile = mockWriteFile as any;
      
      // Mock updateTopRatedBooksIndex to prevent it from running
      jest.spyOn(bookService, 'updateTopRatedBooksIndex').mockImplementation(async () => {});
      
      // Mock all other potential error sources
      jest.spyOn(console, 'error').mockImplementation(() => {});
      jest.spyOn(console, 'log').mockImplementation(() => {});
      
      // Call service method
      const averageRating = await bookService.calculateAverageRating(mockBookId);
      
      // Restore original functions
      jest.spyOn(fileUtils, 'fileExists').mockRestore();
      jest.spyOn(reviewService, 'getReviewsByBook').mockRestore();
      jest.spyOn(bookService, 'updateTopRatedBooksIndex').mockRestore();
      fs.promises.readFile = originalReadFile;
      fs.promises.writeFile = originalWriteFile;
      
      // Assertions
      expect(averageRating).toBeNull();
    });
  });
});
