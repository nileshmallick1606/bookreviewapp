/**
 * Book Index Service
 * 
 * Specialized indexing service for book entities.
 * Provides methods for indexing and looking up books based on various criteria.
 */
import path from 'path';
import { FileStorageManager } from '../storage/fileStorageManager';
import { LockManager } from '../storage/lockManager';
import { IndexService } from './index.service';
import { Book } from '../storage/entityStorage/bookStorage.service';

export class BookIndexService {
  private titleIndex: IndexService<Book>;
  private authorIndex: IndexService<Book>;
  private genreIndex: IndexService<Book>;
  private yearIndex: IndexService<Book>;
  private ratingIndex: IndexService<Book>;
  private indexDir: string;
  
  /**
   * Constructor
   * @param dataDir Base data directory
   * @param fileManager File storage manager
   * @param lockManager Lock manager
   */
  constructor(
    dataDir: string,
    private fileManager: FileStorageManager,
    private lockManager: LockManager
  ) {
    this.indexDir = path.resolve(dataDir, 'indexes', 'books');
    
    // Initialize indexes
    this.titleIndex = new IndexService<Book>(this.indexDir, 'book-title', fileManager, lockManager);
    this.authorIndex = new IndexService<Book>(this.indexDir, 'book-author', fileManager, lockManager);
    this.genreIndex = new IndexService<Book>(this.indexDir, 'book-genre', fileManager, lockManager);
    this.yearIndex = new IndexService<Book>(this.indexDir, 'book-year', fileManager, lockManager);
    this.ratingIndex = new IndexService<Book>(this.indexDir, 'book-rating', fileManager, lockManager);
  }
  
  /**
   * Initialize all indexes
   */
  async initIndexes(): Promise<void> {
    try {
      // Ensure directory exists
      await this.fileManager.ensureDirectory(this.indexDir);
      
      // Initialize all indexes
      await Promise.all([
        this.titleIndex.init(),
        this.authorIndex.init(),
        this.genreIndex.init(),
        this.yearIndex.init(),
        this.ratingIndex.init()
      ]);
    } catch (error) {
      console.error(`Error initializing book indexes: ${error}`);
      throw new Error('Failed to initialize book indexes');
    }
  }
  
  /**
   * Index a book in all indexes
   * @param book Book to index
   */
  async indexBook(book: Book): Promise<void> {
    try {
      const promises = [];
      
      // Add to title index
      if (book.title) {
        promises.push(this.titleIndex.addOrUpdate(book.title, book.id, { caseSensitive: false }));
      }
      
      // Add to author index
      if (book.author) {
        promises.push(this.authorIndex.addOrUpdate(book.author, book.id, { caseSensitive: false }));
      }
      
      // Add to genre indexes (multiple genres per book)
      if (book.genres && book.genres.length > 0) {
        for (const genre of book.genres) {
          promises.push(this.genreIndex.addOrUpdate(genre, book.id, { caseSensitive: false }));
        }
      }
      
      // Add to year index
      if (book.publishedYear) {
        promises.push(this.yearIndex.addOrUpdate(book.publishedYear.toString(), book.id));
      }
      
      // Add to rating index
      if (book.averageRating !== undefined) {
        // Round to nearest 0.5 for easier searching
        const roundedRating = Math.round(book.averageRating * 2) / 2;
        promises.push(this.ratingIndex.addOrUpdate(roundedRating.toString(), book.id));
      }
      
      await Promise.all(promises);
    } catch (error) {
      console.error(`Error indexing book ${book.id}: ${error}`);
      throw new Error(`Failed to index book ${book.id}`);
    }
  }
  
  /**
   * Remove book from all indexes
   * @param bookId Book ID to remove
   */
  async removeBook(bookId: string): Promise<void> {
    try {
      await Promise.all([
        this.titleIndex.removeEntity(bookId),
        this.authorIndex.removeEntity(bookId),
        this.genreIndex.removeEntity(bookId),
        this.yearIndex.removeEntity(bookId),
        this.ratingIndex.removeEntity(bookId)
      ]);
    } catch (error) {
      console.error(`Error removing book ${bookId} from indexes: ${error}`);
      throw new Error(`Failed to remove book ${bookId} from indexes`);
    }
  }
  
  /**
   * Update book indexes
   * @param book Updated book
   */
  async updateBook(book: Book): Promise<void> {
    try {
      // Remove from all indexes first
      await this.removeBook(book.id);
      
      // Re-index
      await this.indexBook(book);
    } catch (error) {
      console.error(`Error updating book ${book.id} in indexes: ${error}`);
      throw new Error(`Failed to update book ${book.id} in indexes`);
    }
  }
  
  /**
   * Rebuild all book indexes from a collection of books
   * @param books Collection of books
   */
  async rebuildIndexes(books: Book[]): Promise<void> {
    try {
      // Rebuild title index
      await this.titleIndex.rebuildIndex(
        books,
        (book: Book) => book.title || '',
        (book: Book) => book.id,
        { caseSensitive: false }
      );
      
      // Rebuild author index
      await this.authorIndex.rebuildIndex(
        books,
        (book: Book) => book.author || '',
        (book: Book) => book.id,
        { caseSensitive: false }
      );
      
      // Rebuild genre index
      await this.genreIndex.rebuildIndex(
        books,
        (book: Book) => book.genres || [],
        (book: Book) => book.id,
        { caseSensitive: false }
      );
      
      // Rebuild year index
      await this.yearIndex.rebuildIndex(
        books,
        (book: Book) => (book.publishedYear || '').toString(),
        (book: Book) => book.id
      );
      
      // Rebuild rating index
      await this.ratingIndex.rebuildIndex(
        books,
        (book: Book) => {
          if (book.averageRating === undefined) {
            return '';
          }
          // Round to nearest 0.5 for easier searching
          const roundedRating = Math.round(book.averageRating * 2) / 2;
          return roundedRating.toString();
        },
        (book: Book) => book.id
      );
    } catch (error) {
      console.error(`Error rebuilding book indexes: ${error}`);
      throw new Error('Failed to rebuild book indexes');
    }
  }
  
  /**
   * Find books by title
   * @param title Book title or part of title
   * @param exactMatch Whether to find exact matches only
   * @returns Array of book IDs
   */
  async findByTitle(title: string, exactMatch = false): Promise<string[]> {
    try {
      if (exactMatch) {
        return await this.titleIndex.lookupExact(title, { caseSensitive: false });
      } else {
        return await this.titleIndex.lookupPartial(title, { caseSensitive: false });
      }
    } catch (error) {
      console.error(`Error finding books by title '${title}': ${error}`);
      throw new Error(`Failed to find books by title '${title}'`);
    }
  }
  
  /**
   * Find books by author
   * @param author Author name or part of name
   * @param exactMatch Whether to find exact matches only
   * @returns Array of book IDs
   */
  async findByAuthor(author: string, exactMatch = false): Promise<string[]> {
    try {
      if (exactMatch) {
        return await this.authorIndex.lookupExact(author, { caseSensitive: false });
      } else {
        return await this.authorIndex.lookupPartial(author, { caseSensitive: false });
      }
    } catch (error) {
      console.error(`Error finding books by author '${author}': ${error}`);
      throw new Error(`Failed to find books by author '${author}'`);
    }
  }
  
  /**
   * Find books by genre
   * @param genre Genre to search for
   * @returns Array of book IDs
   */
  async findByGenre(genre: string): Promise<string[]> {
    try {
      return await this.genreIndex.lookupExact(genre, { caseSensitive: false });
    } catch (error) {
      console.error(`Error finding books by genre '${genre}': ${error}`);
      throw new Error(`Failed to find books by genre '${genre}'`);
    }
  }
  
  /**
   * Find books by description keywords
   * @param keywords Keywords to search for in description
   * @returns Array of book IDs
   */
  async findByDescription(keywords: string): Promise<string[]> {
    // This would require full-text search which we'll implement in a later phase
    // For now, return an empty array
    return [];
  }
  
  /**
   * Find books by published year
   * @param year Published year
   * @returns Array of book IDs
   */
  async findByYear(year: number): Promise<string[]> {
    try {
      return await this.yearIndex.lookupExact(year.toString());
    } catch (error) {
      console.error(`Error finding books by year ${year}: ${error}`);
      throw new Error(`Failed to find books by year ${year}`);
    }
  }
  
  /**
   * Find books by rating range
   * @param minRating Minimum rating
   * @param maxRating Maximum rating
   * @returns Array of book IDs
   */
  async findByRatingRange(minRating = 0, maxRating = 5): Promise<string[]> {
    try {
      // Get all rating keys
      const ratingKeys = await this.ratingIndex.getAllKeys();
      
      // Filter by range
      const filteredKeys = ratingKeys.filter((key) => {
        const rating = parseFloat(key);
        return rating >= minRating && rating <= maxRating;
      });
      
      // Get all matching book IDs
      const bookIds = new Set<string>();
      
      for (const key of filteredKeys) {
        const ids = await this.ratingIndex.lookupExact(key);
        ids.forEach((id) => bookIds.add(id));
      }
      
      return Array.from(bookIds);
    } catch (error) {
      console.error(`Error finding books by rating range ${minRating}-${maxRating}: ${error}`);
      throw new Error(`Failed to find books by rating range ${minRating}-${maxRating}`);
    }
  }
  
  /**
   * Get all available genres
   * @returns Array of genre names
   */
  async getAllGenres(): Promise<string[]> {
    try {
      return await this.genreIndex.getAllKeys();
    } catch (error) {
      console.error(`Error getting all genres: ${error}`);
      throw new Error('Failed to get all genres');
    }
  }
  
  /**
   * Clear all index caches
   */
  clearCaches(): void {
    this.titleIndex.clearCache();
    this.authorIndex.clearCache();
    this.genreIndex.clearCache();
    this.yearIndex.clearCache();
    this.ratingIndex.clearCache();
  }
}
