import api from './api';

/**
 * Interface for book data
 */
export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  genres: string[];
  publishedYear: number;
  createdAt: string;
  updatedAt: string;
  averageRating?: number | null;
  totalReviews?: number; // The count of reviews for this book
}

/**
 * Interface for paginated book response
 */
export interface PaginatedBooks {
  books: Book[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Service for book-related API calls
 */
export const BookService = {
  /**
   * Get a paginated list of books
   * @param page Page number (1-based)
   * @param limit Number of items per page
   * @param sortBy Field to sort by
   * @param sortOrder Sort direction ('asc' or 'desc')
   * @returns Promise with paginated book data
   */
  async getBooks(
    page: number = 1, 
    limit: number = 10, 
    sortBy: string = 'title', 
    sortOrder: string = 'asc'
  ): Promise<PaginatedBooks> {
    try {
      const response = await api.get('/books', {
        params: { page, limit, sortBy, sortOrder }
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching books:', error);
      throw error;
    }
  },

  /**
   * Get a book by ID
   * @param id Book ID
   * @returns Promise with book data
   */
  async getBookById(id: string): Promise<Book> {
    try {
      const response = await api.get(`/books/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching book with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Search for books by title or author
   * @param query Search query
   * @param limit Maximum number of results
   * @returns Promise with book data
   */
  async searchBooks(query: string, limit: number = 10): Promise<Book[]> {
    try {
      const response = await api.get(`/books/search`, {
        params: { q: query, limit }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error searching books:', error);
      throw error;
    }
  },

  /**
   * Get autocomplete suggestions based on query
   * @param query Search query
   * @param limit Maximum number of suggestions
   * @returns Promise with suggestions
   */
  async getSuggestions(query: string, limit: number = 5): Promise<string[]> {
    try {
      const response = await api.get(`/books/suggestions`, {
        params: { q: query, limit }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error getting suggestions:', error);
      throw error;
    }
  },
  
  /**
   * Get top-rated books
   * @param limit Maximum number of books to return
   * @returns Promise with top-rated books
   */
  async getTopRatedBooks(limit: number = 10): Promise<Book[]> {
    try {
      const response = await api.get(`/books/top-rated`, {
        params: { limit }
      });
      return response.data.data.books;
    } catch (error) {
      console.error('Error getting top-rated books:', error);
      throw error;
    }
  },

  /**
   * Create a new book
   * @param bookData Book data
   * @returns Promise with created book
   */
  async createBook(bookData: Partial<Book>): Promise<Book> {
    try {
      const response = await api.post(`/books`, bookData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating book:', error);
      throw error;
    }
  },

  /**
   * Update an existing book
   * @param id Book ID
   * @param bookData Book data to update
   * @returns Promise with updated book
   */
  async updateBook(id: string, bookData: Partial<Book>): Promise<Book> {
    try {
      const response = await api.put(`/books/${id}`, bookData);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating book with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a book
   * @param id Book ID
   * @returns Promise with success status
   */
  async deleteBook(id: string): Promise<void> {
    try {
      await api.delete(`/books/${id}`);
    } catch (error) {
      console.error(`Error deleting book with ID ${id}:`, error);
      throw error;
    }
  }
};
