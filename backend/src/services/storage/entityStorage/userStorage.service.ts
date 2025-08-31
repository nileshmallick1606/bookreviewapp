/**
 * User Storage Service
 * 
 * Specialized storage service for user entities.
 * Extends the base storage service with user-specific validation and operations.
 */
import path from 'path';
import { BaseStorageService, BaseEntity } from '../baseStorage.service';
import { LockManager } from '../lockManager';
import { FileStorageManager } from '../fileStorageManager';

// User entity interface
export interface User extends BaseEntity {
  email: string;
  name: string;
  password?: string;
  profileImage?: string;
  preferences?: {
    favoriteGenres?: string[];
    notificationSettings?: {
      email?: boolean;
      push?: boolean;
    }
  };
}

export class UserStorageService extends BaseStorageService<User> {
  private lockManager: LockManager;
  private fileManager: FileStorageManager;
  private emailIndexPath: string;
  
  /**
   * Constructor
   * @param dataDir Directory for user data
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
    this.emailIndexPath = path.resolve(path.dirname(dataDir), 'indexes', 'email-index.json');
  }
  
  /**
   * Initialize storage with email index
   */
  protected async initStorage(): Promise<void> {
    await super.initStorage();
    
    // Ensure indexes directory exists
    const indexesDir = path.dirname(this.emailIndexPath);
    await this.fileManager.ensureDirectory(indexesDir);
    
    // Create email index if it doesn't exist
    if (!(await this.fileManager.fileExists(this.emailIndexPath))) {
      await this.fileManager.writeJsonFile(this.emailIndexPath, {});
    }
  }
  
  /**
   * Get user by email
   * @param email Email address
   * @returns User or null if not found
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      await this.initStorage();
      
      // Get email index
      const emailIndex = await this.getEmailIndex();
      const userId = emailIndex[email.toLowerCase()];
      
      if (!userId) {
        return null;
      }
      
      return this.getById(userId);
    } catch (error) {
      console.error(`Error finding user by email ${email}: ${error}`);
      throw new Error(`Failed to find user by email ${email}`);
    }
  }
  
  /**
   * Create a new user
   * @param userData User data without ID
   * @returns Created user
   */
  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    try {
      // Check if email already exists
      const existingUser = await this.findByEmail(userData.email);
      if (existingUser) {
        throw new Error(`User with email ${userData.email} already exists`);
      }
      
      // Create user
      const user = await super.create(userData);
      
      // Update email index
      await this.updateEmailIndex(user.email, user.id);
      
      return user;
    } catch (error) {
      console.error(`Error creating user: ${error}`);
      throw new Error(`Failed to create user: ${error}`);
    }
  }
  
  /**
   * Update user
   * @param id User ID
   * @param updates User data updates
   * @returns Updated user
   */
  async update(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User> {
    // Acquire lock for user
    const lock = await this.lockManager.acquireLock(`user:${id}`);
    
    try {
      // Get current user
      const currentUser = await this.getById(id);
      if (!currentUser) {
        throw new Error(`User with ID ${id} not found`);
      }
      
      // Check if email is being changed
      if (updates.email && updates.email !== currentUser.email) {
        // Check if new email already exists
        const existingUser = await this.findByEmail(updates.email);
        if (existingUser && existingUser.id !== id) {
          throw new Error(`User with email ${updates.email} already exists`);
        }
        
        // Update email index
        await this.updateEmailIndex(updates.email, id);
        
        // Remove old email from index
        await this.removeFromEmailIndex(currentUser.email);
      }
      
      // Update user
      const updatedUser = await super.update(id, updates);
      return updatedUser;
    } catch (error) {
      console.error(`Error updating user ${id}: ${error}`);
      throw new Error(`Failed to update user ${id}: ${error}`);
    } finally {
      // Release lock
      await this.lockManager.releaseLock(lock);
    }
  }
  
  /**
   * Delete user
   * @param id User ID
   * @returns True if deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    // Acquire lock for user
    const lock = await this.lockManager.acquireLock(`user:${id}`);
    
    try {
      // Get user
      const user = await this.getById(id);
      if (!user) {
        return false;
      }
      
      // Remove from email index
      await this.removeFromEmailIndex(user.email);
      
      // Delete user
      return await super.delete(id);
    } catch (error) {
      console.error(`Error deleting user ${id}: ${error}`);
      throw new Error(`Failed to delete user ${id}`);
    } finally {
      // Release lock
      await this.lockManager.releaseLock(lock);
    }
  }
  
  /**
   * Get email index
   * @returns Email to user ID mapping
   */
  private async getEmailIndex(): Promise<Record<string, string>> {
    try {
      const data = await this.fileManager.readJsonFile<Record<string, string>>(this.emailIndexPath);
      return data || {};
    } catch (error) {
      console.error(`Error getting email index: ${error}`);
      return {};
    }
  }
  
  /**
   * Update email index
   * @param email Email address
   * @param userId User ID
   */
  private async updateEmailIndex(email: string, userId: string): Promise<void> {
    // Acquire lock for email index
    const lock = await this.lockManager.acquireLock('email-index');
    
    try {
      const emailIndex = await this.getEmailIndex();
      emailIndex[email.toLowerCase()] = userId;
      await this.fileManager.writeJsonFile(this.emailIndexPath, emailIndex);
    } catch (error) {
      console.error(`Error updating email index: ${error}`);
      throw new Error('Failed to update email index');
    } finally {
      // Release lock
      await this.lockManager.releaseLock(lock);
    }
  }
  
  /**
   * Remove email from index
   * @param email Email address
   */
  private async removeFromEmailIndex(email: string): Promise<void> {
    // Acquire lock for email index
    const lock = await this.lockManager.acquireLock('email-index');
    
    try {
      const emailIndex = await this.getEmailIndex();
      delete emailIndex[email.toLowerCase()];
      await this.fileManager.writeJsonFile(this.emailIndexPath, emailIndex);
    } catch (error) {
      console.error(`Error removing from email index: ${error}`);
      throw new Error('Failed to remove from email index');
    } finally {
      // Release lock
      await this.lockManager.releaseLock(lock);
    }
  }
  
  /**
   * Validate user entity
   * @param user User to validate
   */
  protected async validateEntity(user: User): Promise<void> {
    // Validate required fields
    if (!user.email) {
      throw new Error('User email is required');
    }
    
    if (!user.name) {
      throw new Error('User name is required');
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      throw new Error('Invalid email format');
    }
  }
}
