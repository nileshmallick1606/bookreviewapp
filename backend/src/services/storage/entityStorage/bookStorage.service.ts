/**
 * Book Storage Service
 * 
 * Specialized storage service for book entities.
 * Extends the base storage service with book-specific validation and operations.
 */
import path from 'path';
import { BaseStorageService, BaseEntity } from '../baseStorage.service';
import { LockManager } from '../lockManager';
import { FileStorageManager } from '../fileStorageManager';

// Book entity interface
export interface Book extends BaseEntity {
  title: string;
  author: string;
  description: string;
  coverImage?: string;
  genres: string[];
  publishedYear: number;
  averageRating?: number;
  totalReviews?: number;
}

export class BookStorageService extends BaseStorageService<Book> {
  private lockManager: LockManager;
  private fileManager: FileStorageManager;
  private titleIndexPath: string;
  private authorIndexPath: string;
  private genreIndexPath: string;
  
  /**
   * Constructor
   * @param dataDir Directory for book data
   * @param lockManager Lock manager instance
   * @param fileManager File manager instance
   */
  constructor(
    dataDir: string,
    lockManager: LockManager,
    fileManager: FileStorageManager
  ) {
    super(dataDir);
    this.lockManager = lockManager;
    this.fileManager = fileManager;
    
    const indexesDir = path.resolve(path.dirname(dataDir), 'indexes');
    this.titleIndexPath = path.resolve(indexesDir, 'book-title-index.json');
    this.authorIndexPath = path.resolve(indexesDir, 'book-author-index.json');
    this.genreIndexPath = path.resolve(indexesDir, 'book-genre-index.json');
  }
  
  /**
   * Initialize storage with indexes
   */
  protected async initStorage(): Promise<void> {
    await super.initStorage();
    
    // Ensure indexes directory exists
    const indexesDir = path.dirname(this.titleIndexPath);
    await this.fileManager.ensureDirectory(indexesDir);
    
    // Create indexes if they don't exist
    const indexPaths = [this.titleIndexPath, this.authorIndexPath, this.genreIndexPath];
    
    for (const indexPath of indexPaths) {
      if (!(await this.fileManager.fileExists(indexPath))) {
        await this.fileManager.writeJsonFile(indexPath, {});
      }
    }
  }
  
  /**
   * Create a new book
   * @param bookData Book data without ID
   * @returns Created book
   */
  async create(bookData: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>): Promise<Book> {
    try {
      // Create book
      const book = await super.create({
        ...bookData,
        // Initialize rating fields if not provided
        averageRating: bookData.averageRating || 0,
        totalReviews: bookData.totalReviews || 0
      });
      
      // Update indexes
      await this.updateTitleIndex(book.title, book.id);
      await this.updateAuthorIndex(book.author, book.id);
      await this.updateGenreIndexes(book.genres, book.id);
      
      return book;
    } catch (error) {
      console.error(`Error creating book: ${error}`);
      throw new Error(`Failed to create book: ${error}`);
    }
  }
  
  /**
   * Update book
   * @param id Book ID
   * @param updates Book data updates
   * @returns Updated book
   */
  async update(id: string, updates: Partial<Omit<Book, 'id' | 'createdAt'>>): Promise<Book> {
    // Acquire lock for book
    const lock = await this.lockManager.acquireLock(`book:${id}`);
    
    try {
      // Get current book
      const currentBook = await this.getById(id);
      if (!currentBook) {
        throw new Error(`Book with ID ${id} not found`);
      }
      
      // Check if title is being changed
      if (updates.title && updates.title !== currentBook.title) {
        // Update title index
        await this.updateTitleIndex(updates.title, id);
        await this.removeFromTitleIndex(currentBook.title, id);
      }
      
      // Check if author is being changed
      if (updates.author && updates.author !== currentBook.author) {
        // Update author index
        await this.updateAuthorIndex(updates.author, id);
        await this.removeFromAuthorIndex(currentBook.author, id);
      }
      
      // Check if genres are being changed
      if (updates.genres) {
        // Update genre indexes
        await this.updateGenreIndexes(updates.genres, id);
        
        // Remove from old genres not in new list
        if (currentBook.genres) {
          const genresToRemove = currentBook.genres.filter(
            genre => !updates.genres?.includes(genre)
          );
          
          for (const genre of genresToRemove) {
            await this.removeFromGenreIndex(genre, id);
          }
        }
      }
      
      // Update book
      const updatedBook = await super.update(id, updates);
      return updatedBook;
    } catch (error) {
      console.error(`Error updating book ${id}: ${error}`);
      throw new Error(`Failed to update book ${id}: ${error}`);
    } finally {
      // Release lock
      await this.lockManager.releaseLock(lock);
    }
  }
  
  /**
   * Delete book
   * @param id Book ID
   * @returns True if deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    // Acquire lock for book
    const lock = await this.lockManager.acquireLock(`book:${id}`);
    
    try {
      // Get book
      const book = await this.getById(id);
      if (!book) {
        return false;
      }
      
      // Remove from indexes
      await this.removeFromTitleIndex(book.title, id);
      await this.removeFromAuthorIndex(book.author, id);
      
      for (const genre of book.genres) {
        await this.removeFromGenreIndex(genre, id);
      }
      
      // Delete book
      return await super.delete(id);
    } catch (error) {
      console.error(`Error deleting book ${id}: ${error}`);
      throw new Error(`Failed to delete book ${id}`);
    } finally {
      // Release lock
      await this.lockManager.releaseLock(lock);
    }
  }
  
  /**
   * Find books by title (partial match)
   * @param title Title to search for
   * @returns Array of matching books
   */
  async findByTitle(title: string): Promise<Book[]> {
    try {
      await this.initStorage();
      
      // Get title index
      const titleIndex = await this.getTitleIndex();
      const bookIds: string[] = [];
      
      // Do a case-insensitive partial match
      const normalizedSearch = title.toLowerCase();
      
      for (const [indexedTitle, ids] of Object.entries(titleIndex)) {
        if (indexedTitle.toLowerCase().includes(normalizedSearch)) {
          bookIds.push(...ids);
        }
      }
      
      // Remove duplicates
      const uniqueBookIds = [...new Set(bookIds)];
      
      // Get books by IDs
      const books: Book[] = [];
      for (const bookId of uniqueBookIds) {
        const book = await this.getById(bookId);
        if (book) {
          books.push(book);
        }
      }
      
      return books;
    } catch (error) {
      console.error(`Error finding books by title ${title}: ${error}`);
      throw new Error(`Failed to find books by title ${title}`);
    }
  }
  
  /**
   * Find books by author (partial match)
   * @param author Author to search for
   * @returns Array of matching books
   */
  async findByAuthor(author: string): Promise<Book[]> {
    try {
      await this.initStorage();
      
      // Get author index
      const authorIndex = await this.getAuthorIndex();
      const bookIds: string[] = [];
      
      // Do a case-insensitive partial match
      const normalizedSearch = author.toLowerCase();
      
      for (const [indexedAuthor, ids] of Object.entries(authorIndex)) {
        if (indexedAuthor.toLowerCase().includes(normalizedSearch)) {
          bookIds.push(...ids);
        }
      }
      
      // Remove duplicates
      const uniqueBookIds = [...new Set(bookIds)];
      
      // Get books by IDs
      const books: Book[] = [];
      for (const bookId of uniqueBookIds) {
        const book = await this.getById(bookId);
        if (book) {
          books.push(book);
        }
      }
      
      return books;
    } catch (error) {
      console.error(`Error finding books by author ${author}: ${error}`);
      throw new Error(`Failed to find books by author ${author}`);
    }
  }
  
  /**
   * Find books by genre
   * @param genre Genre to search for
   * @returns Array of matching books
   */
  async findByGenre(genre: string): Promise<Book[]> {
    try {
      await this.initStorage();
      
      // Get genre index
      const genreIndex = await this.getGenreIndex();
      
      // Find books with this genre
      const bookIds = genreIndex[genre.toLowerCase()] || [];
      
      // Get books by IDs
      const books: Book[] = [];
      for (const bookId of bookIds) {
        const book = await this.getById(bookId);
        if (book) {
          books.push(book);
        }
      }
      
      return books;
    } catch (error) {
      console.error(`Error finding books by genre ${genre}: ${error}`);
      throw new Error(`Failed to find books by genre ${genre}`);
    }
  }
  
  /**
   * Update title index
   * @param title Book title
   * @param bookId Book ID
   */
  private async updateTitleIndex(title: string, bookId: string): Promise<void> {
    // Acquire lock for title index
    const lock = await this.lockManager.acquireLock('book-title-index');
    
    try {
      const titleIndex = await this.getTitleIndex();
      
      if (!titleIndex[title]) {
        titleIndex[title] = [];
      }
      
      if (!titleIndex[title].includes(bookId)) {
        titleIndex[title].push(bookId);
      }
      
      await this.fileManager.writeJsonFile(this.titleIndexPath, titleIndex);
    } catch (error) {
      console.error(`Error updating title index: ${error}`);
      throw new Error('Failed to update title index');
    } finally {
      // Release lock
      await this.lockManager.releaseLock(lock);
    }
  }
  
  /**
   * Remove book from title index
   * @param title Book title
   * @param bookId Book ID
   */
  private async removeFromTitleIndex(title: string, bookId: string): Promise<void> {
    // Acquire lock for title index
    const lock = await this.lockManager.acquireLock('book-title-index');
    
    try {
      const titleIndex = await this.getTitleIndex();
      
      if (titleIndex[title]) {
        titleIndex[title] = titleIndex[title].filter(id => id !== bookId);
        
        if (titleIndex[title].length === 0) {
          delete titleIndex[title];
        }
      }
      
      await this.fileManager.writeJsonFile(this.titleIndexPath, titleIndex);
    } catch (error) {
      console.error(`Error removing from title index: ${error}`);
      throw new Error('Failed to remove from title index');
    } finally {
      // Release lock
      await this.lockManager.releaseLock(lock);
    }
  }
  
  /**
   * Update author index
   * @param author Book author
   * @param bookId Book ID
   */
  private async updateAuthorIndex(author: string, bookId: string): Promise<void> {
    // Acquire lock for author index
    const lock = await this.lockManager.acquireLock('book-author-index');
    
    try {
      const authorIndex = await this.getAuthorIndex();
      
      if (!authorIndex[author]) {
        authorIndex[author] = [];
      }
      
      if (!authorIndex[author].includes(bookId)) {
        authorIndex[author].push(bookId);
      }
      
      await this.fileManager.writeJsonFile(this.authorIndexPath, authorIndex);
    } catch (error) {
      console.error(`Error updating author index: ${error}`);
      throw new Error('Failed to update author index');
    } finally {
      // Release lock
      await this.lockManager.releaseLock(lock);
    }
  }
  
  /**
   * Remove book from author index
   * @param author Book author
   * @param bookId Book ID
   */
  private async removeFromAuthorIndex(author: string, bookId: string): Promise<void> {
    // Acquire lock for author index
    const lock = await this.lockManager.acquireLock('book-author-index');
    
    try {
      const authorIndex = await this.getAuthorIndex();
      
      if (authorIndex[author]) {
        authorIndex[author] = authorIndex[author].filter(id => id !== bookId);
        
        if (authorIndex[author].length === 0) {
          delete authorIndex[author];
        }
      }
      
      await this.fileManager.writeJsonFile(this.authorIndexPath, authorIndex);
    } catch (error) {
      console.error(`Error removing from author index: ${error}`);
      throw new Error('Failed to remove from author index');
    } finally {
      // Release lock
      await this.lockManager.releaseLock(lock);
    }
  }
  
  /**
   * Update genre indexes
   * @param genres Book genres
   * @param bookId Book ID
   */
  private async updateGenreIndexes(genres: string[], bookId: string): Promise<void> {
    for (const genre of genres) {
      await this.updateGenreIndex(genre, bookId);
    }
  }
  
  /**
   * Update genre index
   * @param genre Book genre
   * @param bookId Book ID
   */
  private async updateGenreIndex(genre: string, bookId: string): Promise<void> {
    // Acquire lock for genre index
    const lock = await this.lockManager.acquireLock('book-genre-index');
    
    try {
      const genreIndex = await this.getGenreIndex();
      const normalizedGenre = genre.toLowerCase();
      
      if (!genreIndex[normalizedGenre]) {
        genreIndex[normalizedGenre] = [];
      }
      
      if (!genreIndex[normalizedGenre].includes(bookId)) {
        genreIndex[normalizedGenre].push(bookId);
      }
      
      await this.fileManager.writeJsonFile(this.genreIndexPath, genreIndex);
    } catch (error) {
      console.error(`Error updating genre index: ${error}`);
      throw new Error('Failed to update genre index');
    } finally {
      // Release lock
      await this.lockManager.releaseLock(lock);
    }
  }
  
  /**
   * Remove book from genre index
   * @param genre Book genre
   * @param bookId Book ID
   */
  private async removeFromGenreIndex(genre: string, bookId: string): Promise<void> {
    // Acquire lock for genre index
    const lock = await this.lockManager.acquireLock('book-genre-index');
    
    try {
      const genreIndex = await this.getGenreIndex();
      const normalizedGenre = genre.toLowerCase();
      
      if (genreIndex[normalizedGenre]) {
        genreIndex[normalizedGenre] = genreIndex[normalizedGenre].filter(id => id !== bookId);
        
        if (genreIndex[normalizedGenre].length === 0) {
          delete genreIndex[normalizedGenre];
        }
      }
      
      await this.fileManager.writeJsonFile(this.genreIndexPath, genreIndex);
    } catch (error) {
      console.error(`Error removing from genre index: ${error}`);
      throw new Error('Failed to remove from genre index');
    } finally {
      // Release lock
      await this.lockManager.releaseLock(lock);
    }
  }
  
  /**
   * Get title index
   * @returns Title to book IDs mapping
   */
  private async getTitleIndex(): Promise<Record<string, string[]>> {
    try {
      const data = await this.fileManager.readJsonFile<Record<string, string[]>>(this.titleIndexPath);
      return data || {};
    } catch (error) {
      console.error(`Error getting title index: ${error}`);
      return {};
    }
  }
  
  /**
   * Get author index
   * @returns Author to book IDs mapping
   */
  private async getAuthorIndex(): Promise<Record<string, string[]>> {
    try {
      const data = await this.fileManager.readJsonFile<Record<string, string[]>>(this.authorIndexPath);
      return data || {};
    } catch (error) {
      console.error(`Error getting author index: ${error}`);
      return {};
    }
  }
  
  /**
   * Get genre index
   * @returns Genre to book IDs mapping
   */
  private async getGenreIndex(): Promise<Record<string, string[]>> {
    try {
      const data = await this.fileManager.readJsonFile<Record<string, string[]>>(this.genreIndexPath);
      return data || {};
    } catch (error) {
      console.error(`Error getting genre index: ${error}`);
      return {};
    }
  }
  
  /**
   * Validate book entity
   * @param book Book to validate
   */
  protected async validateEntity(book: Book): Promise<void> {
    // Validate required fields
    if (!book.title) {
      throw new Error('Book title is required');
    }
    
    if (!book.author) {
      throw new Error('Book author is required');
    }
    
    if (!book.description) {
      throw new Error('Book description is required');
    }
    
    if (!Array.isArray(book.genres) || book.genres.length === 0) {
      throw new Error('Book must have at least one genre');
    }
    
    // Validate published year
    if (!book.publishedYear || 
        typeof book.publishedYear !== 'number' || 
        book.publishedYear < 0) {
      throw new Error('Book must have a valid published year');
    }
  }
}
