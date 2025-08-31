/**
 * User Index Service
 * 
 * Specialized indexing service for user entities.
 * Provides methods for indexing and looking up users based on various criteria.
 */
import path from 'path';
import { FileStorageManager } from '../storage/fileStorageManager';
import { LockManager } from '../storage/lockManager';
import { IndexService } from './index.service';
import { User } from '../storage/entityStorage/userStorage.service';

export class UserIndexService {
  private emailIndex: IndexService<User>;
  private nameIndex: IndexService<User>;
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
    this.indexDir = path.resolve(dataDir, 'indexes', 'users');
    
    // Initialize indexes
    this.emailIndex = new IndexService<User>(this.indexDir, 'user-email', fileManager, lockManager);
    this.nameIndex = new IndexService<User>(this.indexDir, 'user-name', fileManager, lockManager);
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
        this.emailIndex.init(),
        this.nameIndex.init()
      ]);
    } catch (error) {
      console.error(`Error initializing user indexes: ${error}`);
      throw new Error('Failed to initialize user indexes');
    }
  }
  
  /**
   * Index a user in all indexes
   * @param user User to index
   */
  async indexUser(user: User): Promise<void> {
    try {
      const promises = [];
      
      // Add to email index (unique)
      if (user.email) {
        promises.push(this.emailIndex.addOrUpdate(user.email, user.id, { 
          unique: true, 
          caseSensitive: false 
        }));
      }
      
      // Add to name index
      if (user.name) {
        promises.push(this.nameIndex.addOrUpdate(user.name, user.id, { 
          caseSensitive: false 
        }));
      }
      
      await Promise.all(promises);
    } catch (error) {
      console.error(`Error indexing user ${user.id}: ${error}`);
      throw new Error(`Failed to index user ${user.id}`);
    }
  }
  
  /**
   * Remove user from all indexes
   * @param userId User ID to remove
   */
  async removeUser(userId: string): Promise<void> {
    try {
      await Promise.all([
        this.emailIndex.removeEntity(userId),
        this.nameIndex.removeEntity(userId)
      ]);
    } catch (error) {
      console.error(`Error removing user ${userId} from indexes: ${error}`);
      throw new Error(`Failed to remove user ${userId} from indexes`);
    }
  }
  
  /**
   * Update user indexes
   * @param user Updated user
   */
  async updateUser(user: User): Promise<void> {
    try {
      // Remove from all indexes first
      await this.removeUser(user.id);
      
      // Re-index
      await this.indexUser(user);
    } catch (error) {
      console.error(`Error updating user ${user.id} in indexes: ${error}`);
      throw new Error(`Failed to update user ${user.id} in indexes`);
    }
  }
  
  /**
   * Rebuild all user indexes from a collection of users
   * @param users Collection of users
   */
  async rebuildIndexes(users: User[]): Promise<void> {
    try {
      // Rebuild email index
      await this.emailIndex.rebuildIndex(
        users,
        (user: User) => user.email || '',
        (user: User) => user.id,
        { unique: true, caseSensitive: false }
      );
      
      // Rebuild name index
      await this.nameIndex.rebuildIndex(
        users,
        (user: User) => user.name || '',
        (user: User) => user.id,
        { caseSensitive: false }
      );
    } catch (error) {
      console.error(`Error rebuilding user indexes: ${error}`);
      throw new Error('Failed to rebuild user indexes');
    }
  }
  
  /**
   * Find user by email
   * @param email Email to search for
   * @returns User ID or null if not found
   */
  async findByEmail(email: string): Promise<string | null> {
    try {
      const results = await this.emailIndex.lookupExact(email, { caseSensitive: false });
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error(`Error finding user by email '${email}': ${error}`);
      throw new Error(`Failed to find user by email '${email}'`);
    }
  }
  
  /**
   * Find user by email (alternative to username)
   * @param email Email to search for
   * @returns User ID or null if not found
   */
  async findByEmailOrName(email: string): Promise<string | null> {
    try {
      // Try email first
      const emailResult = await this.emailIndex.lookupExact(email, { caseSensitive: false });
      if (emailResult.length > 0) {
        return emailResult[0];
      }
      
      // Try as name
      const nameResult = await this.nameIndex.lookupExact(email, { caseSensitive: false });
      return nameResult.length > 0 ? nameResult[0] : null;
    } catch (error) {
      console.error(`Error finding user by email or name '${email}': ${error}`);
      throw new Error(`Failed to find user by email or name '${email}'`);
    }
  }
  
  /**
   * Find users by name
   * @param name Name or part of name
   * @param exactMatch Whether to find exact matches only
   * @returns Array of user IDs
   */
  async findByName(name: string, exactMatch = false): Promise<string[]> {
    try {
      if (exactMatch) {
        return await this.nameIndex.lookupExact(name, { caseSensitive: false });
      } else {
        return await this.nameIndex.lookupPartial(name, { caseSensitive: false });
      }
    } catch (error) {
      console.error(`Error finding users by name '${name}': ${error}`);
      throw new Error(`Failed to find users by name '${name}'`);
    }
  }
  
  /**
   * Clear all index caches
   */
  clearCaches(): void {
    this.emailIndex.clearCache();
    this.nameIndex.clearCache();
  }
}
