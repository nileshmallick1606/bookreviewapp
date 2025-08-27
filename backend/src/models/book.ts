import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Book } from './interfaces/book.interface';

// Path to book data directory
const BOOKS_DIR = path.join(__dirname, '../../data/books');
// Path to indexes directory
const INDEXES_DIR = path.join(__dirname, '../../data/indexes');

/**
 * Book model class for handling file-based book data operations
 */
export class BookModel {
  /**
   * Get a list of books with pagination
   * @param page Page number (1-based)
   * @param limit Number of items per page
   * @param sortBy Field to sort by
   * @param sortOrder Sort direction ('asc' or 'desc')
   * @returns Paginated list of books with metadata
   */
  static async getBooks(page: number = 1, limit: number = 10, sortBy: string = 'title', sortOrder: string = 'asc'): Promise<{
    books: Book[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      // Ensure books directory exists
      if (!fs.existsSync(BOOKS_DIR)) {
        fs.mkdirSync(BOOKS_DIR, { recursive: true });
      }
      
      // Read all book files
      const fileNames = fs.readdirSync(BOOKS_DIR);
      const bookPromises = fileNames.map(async (fileName) => {
        const filePath = path.join(BOOKS_DIR, fileName);
        const fileContent = await fs.promises.readFile(filePath, 'utf-8');
        return JSON.parse(fileContent) as Book;
      });
      
      // Resolve all book data
      let books = await Promise.all(bookPromises);
      
      // Sort books
      books = books.sort((a, b) => {
        const valueA = a[sortBy as keyof Book];
        const valueB = b[sortBy as keyof Book];
        
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return sortOrder === 'asc' 
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        }
        
        // For numeric values
        if (valueA !== undefined && valueB !== undefined) {
          if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
          if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
        }
        return 0;
      });
      
      // Calculate pagination
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedBooks = books.slice(startIndex, endIndex);
      
      return {
        books: paginatedBooks,
        total: books.length,
        page,
        limit,
        totalPages: Math.ceil(books.length / limit)
      };
    } catch (error) {
      console.error('Error fetching books:', error);
      throw error;
    }
  }

  /**
   * Get a book by ID
   * @param id Book ID
   * @returns Book data or null if not found
   */
  static async getBookById(id: string): Promise<Book | null> {
    try {
      const filePath = path.join(BOOKS_DIR, `${id}.json`);
      
      if (!fs.existsSync(filePath)) {
        return null;
      }
      
      const fileContent = await fs.promises.readFile(filePath, 'utf-8');
      return JSON.parse(fileContent) as Book;
    } catch (error) {
      console.error(`Error fetching book with ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Search for books by title or author
   * @param query Search query
   * @param limit Maximum number of results
   * @returns Array of matching books
   */
  static async searchBooks(query: string, limit: number = 10): Promise<Book[]> {
    try {
      // Ensure books directory exists
      if (!fs.existsSync(BOOKS_DIR)) {
        fs.mkdirSync(BOOKS_DIR, { recursive: true });
        return [];
      }
      
      // Read all book files
      const fileNames = fs.readdirSync(BOOKS_DIR);
      const bookPromises = fileNames.map(async (fileName) => {
        const filePath = path.join(BOOKS_DIR, fileName);
        const fileContent = await fs.promises.readFile(filePath, 'utf-8');
        return JSON.parse(fileContent) as Book;
      });
      
      // Resolve all book data
      const books = await Promise.all(bookPromises);
      
      // Normalize query for case-insensitive search
      const normalizedQuery = query.toLowerCase();
      
      // Filter books based on title or author
      const filteredBooks = books.filter(book => {
        const titleMatch = book.title.toLowerCase().includes(normalizedQuery);
        const authorMatch = book.author.toLowerCase().includes(normalizedQuery);
        return titleMatch || authorMatch;
      });
      
      // Return limited results
      return filteredBooks.slice(0, limit);
    } catch (error) {
      console.error('Error searching books:', error);
      throw error;
    }
  }
  
  /**
   * Get autocomplete suggestions based on query
   * @param query Search query
   * @param limit Maximum number of suggestions
   * @returns Array of suggestions (title or author)
   */
  static async getSuggestions(query: string, limit: number = 5): Promise<string[]> {
    try {
      const books = await this.searchBooks(query, 20); // Get a larger set to extract suggestions from
      
      // Extract titles and authors that match the query
      const titleSuggestions = books
        .filter(book => book.title.toLowerCase().includes(query.toLowerCase()))
        .map(book => book.title);
      
      const authorSuggestions = books
        .filter(book => book.author.toLowerCase().includes(query.toLowerCase()))
        .map(book => book.author);
      
      // Combine unique suggestions
      const allSuggestions = [...new Set([...titleSuggestions, ...authorSuggestions])];
      
      // Return limited results
      return allSuggestions.slice(0, limit);
    } catch (error) {
      console.error('Error getting suggestions:', error);
      throw error;
    }
  }

  /**
   * Create a new book
   * @param bookData Book data without ID
   * @returns Created book with ID
   */
  static async createBook(bookData: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>): Promise<Book> {
    try {
      // Ensure books directory exists
      if (!fs.existsSync(BOOKS_DIR)) {
        fs.mkdirSync(BOOKS_DIR, { recursive: true });
      }
      
      // Generate ID and timestamps
      const id = uuidv4();
      const now = new Date();
      
      const newBook: Book = {
        ...bookData,
        id,
        createdAt: now,
        updatedAt: now
      };
      
      // Write to file
      const filePath = path.join(BOOKS_DIR, `${id}.json`);
      await fs.promises.writeFile(filePath, JSON.stringify(newBook, null, 2));
      
      return newBook;
    } catch (error) {
      console.error('Error creating book:', error);
      throw error;
    }
  }

  /**
   * Update an existing book
   * @param id Book ID
   * @param bookData Book data to update
   * @returns Updated book
   */
  static async updateBook(id: string, bookData: Partial<Book>): Promise<Book | null> {
    try {
      const book = await this.getBookById(id);
      
      if (!book) {
        return null;
      }
      
      // Update book data
      const updatedBook: Book = {
        ...book,
        ...bookData,
        id, // Ensure ID doesn't change
        updatedAt: new Date()
      };
      
      // Write to file
      const filePath = path.join(BOOKS_DIR, `${id}.json`);
      await fs.promises.writeFile(filePath, JSON.stringify(updatedBook, null, 2));
      
      return updatedBook;
    } catch (error) {
      console.error(`Error updating book with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a book
   * @param id Book ID
   * @returns True if deleted, false if not found
   */
  static async deleteBook(id: string): Promise<boolean> {
    try {
      const filePath = path.join(BOOKS_DIR, `${id}.json`);
      
      if (!fs.existsSync(filePath)) {
        return false;
      }
      
      // Delete file
      await fs.promises.unlink(filePath);
      
      return true;
    } catch (error) {
      console.error(`Error deleting book with ID ${id}:`, error);
      throw error;
    }
  }
}
