/**
 * Storage Service Provider
 * 
 * Configures and provides all storage-related services to the application.
 */
import path from 'path';
import { FileStorageManager } from './storage/fileStorageManager';
import { LockManager } from './storage/lockManager';
import { UserStorageService } from './storage/entityStorage/userStorage.service';
import { BookStorageService } from './storage/entityStorage/bookStorage.service';
import { ReviewStorageService } from './storage/entityStorage/reviewStorage.service';
import { IndexManager } from './indexing/index.manager';
import { DataMigrationService } from './migration/dataMigration.service';

export class StorageServiceProvider {
  private static instance: StorageServiceProvider;
  
  // Services
  private fileManager: FileStorageManager;
  private lockManager: LockManager;
  private userStorage: UserStorageService;
  private bookStorage: BookStorageService;
  private reviewStorage: ReviewStorageService;
  private indexManager: IndexManager;
  private migrationService: DataMigrationService;
  
  private constructor() {
    const dataDir = path.resolve(process.cwd(), 'data');
    const locksDir = path.join(dataDir, 'locks');
    
    // Initialize services
    this.fileManager = new FileStorageManager();
    this.lockManager = new LockManager(locksDir);
    
    this.userStorage = new UserStorageService(
      path.join(dataDir, 'users'),
      this.lockManager,
      this.fileManager
    );
    
    this.bookStorage = new BookStorageService(
      path.join(dataDir, 'books'),
      this.lockManager,
      this.fileManager
    );
    
    this.reviewStorage = new ReviewStorageService(
      path.join(dataDir, 'reviews'),
      this.lockManager,
      this.fileManager
    );
    
    this.indexManager = new IndexManager(dataDir);
    this.migrationService = new DataMigrationService();
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(): StorageServiceProvider {
    if (!StorageServiceProvider.instance) {
      StorageServiceProvider.instance = new StorageServiceProvider();
    }
    
    return StorageServiceProvider.instance;
  }
  
  /**
   * Initialize all storage services
   */
  public async initialize(): Promise<void> {
    try {
      console.log('Initializing storage services...');
      
      // Create necessary directories
      await this.fileManager.ensureDirectory(path.resolve(process.cwd(), 'data'));
      await this.fileManager.ensureDirectory(path.join(process.cwd(), 'data', 'users'));
      await this.fileManager.ensureDirectory(path.join(process.cwd(), 'data', 'books'));
      await this.fileManager.ensureDirectory(path.join(process.cwd(), 'data', 'reviews'));
      await this.fileManager.ensureDirectory(path.join(process.cwd(), 'data', 'indexes'));
      await this.fileManager.ensureDirectory(path.join(process.cwd(), 'data', 'locks'));
      
      // Initialize index manager
      await this.indexManager.initIndexes();
      
      console.log('Storage services initialized successfully.');
    } catch (error) {
      console.error('Failed to initialize storage services:', error);
      throw error;
    }
  }
  
  // Getters for services
  
  public getUserStorage(): UserStorageService {
    return this.userStorage;
  }
  
  public getBookStorage(): BookStorageService {
    return this.bookStorage;
  }
  
  public getReviewStorage(): ReviewStorageService {
    return this.reviewStorage;
  }
  
  public getIndexManager(): IndexManager {
    return this.indexManager;
  }
  
  public getMigrationService(): DataMigrationService {
    return this.migrationService;
  }
}
