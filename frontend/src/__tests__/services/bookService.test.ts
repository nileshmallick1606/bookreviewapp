import { BookService } from '../../../src/services/bookService';
import api from '../../../src/services/api';

// Mock the API
jest.mock('../../../src/services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn()
  }
}));

describe('BookService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTopRatedBooks', () => {
    it('should fetch top-rated books with default limit', async () => {
      // Mock successful API response
      const mockBooks = [
        { id: 'book1', title: 'Book 1', averageRating: 5.0 },
        { id: 'book2', title: 'Book 2', averageRating: 4.5 }
      ];
      
      (api.get as jest.Mock).mockResolvedValue({
        data: {
          status: 'success',
          data: {
            books: mockBooks
          }
        }
      });

      // Call the service method
      const result = await BookService.getTopRatedBooks();
      
      // Verify API was called correctly
      expect(api.get).toHaveBeenCalledWith('/books/top-rated');
      
      // Verify returned data
      expect(result).toEqual(mockBooks);
    });

    it('should fetch top-rated books with custom limit', async () => {
      // Mock successful API response
      const mockBooks = [
        { id: 'book1', title: 'Book 1', averageRating: 5.0 },
        { id: 'book2', title: 'Book 2', averageRating: 4.5 }
      ];
      
      (api.get as jest.Mock).mockResolvedValue({
        data: {
          status: 'success',
          data: {
            books: mockBooks
          }
        }
      });

      // Call the service method with custom limit
      const result = await BookService.getTopRatedBooks(5);
      
      // Verify API was called correctly with limit parameter
      expect(api.get).toHaveBeenCalledWith('/books/top-rated?limit=5');
      
      // Verify returned data
      expect(result).toEqual(mockBooks);
    });

    it('should handle empty response', async () => {
      // Mock empty API response
      (api.get as jest.Mock).mockResolvedValue({
        data: {
          status: 'success',
          data: {
            books: []
          }
        }
      });

      // Call the service method
      const result = await BookService.getTopRatedBooks();
      
      // Verify returned data is an empty array
      expect(result).toEqual([]);
    });

    it('should handle API errors', async () => {
      // Mock API error
      (api.get as jest.Mock).mockRejectedValue(new Error('API Error'));

      // Expect service method to throw error
      await expect(BookService.getTopRatedBooks()).rejects.toThrow('API Error');
    });

    it('should handle unexpected response format', async () => {
      // Mock malformed API response
      (api.get as jest.Mock).mockResolvedValue({
        data: {
          status: 'success',
          // Missing data.books
          data: {}
        }
      });

      // Expect service method to handle gracefully with empty array
      const result = await BookService.getTopRatedBooks();
      expect(result).toEqual([]);
    });
  });
});
