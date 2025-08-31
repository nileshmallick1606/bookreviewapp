/**
 * Index Service
 * 
 * Provides an indexing mechanism for efficient lookup of entities based on various criteria.
 * This is part of the implementation for US 9.2: Data Indexing
 */
import path from 'path';
import { FileStorageManager } from '../storage/fileStorageManager';
import { LockManager } from '../storage/lockManager';

export interface IndexOptions {
  unique?: boolean;
  caseSensitive?: boolean;
}

export class IndexService<T extends Record<string, any>> {
  private indexDir: string;
  private fileManager: FileStorageManager;
  private lockManager: LockManager;
  private indexName: string;
  private indexPath: string;
  private cachedIndex: Record<string, string[]> | null = null;
  
  /**
   * Constructor
   * @param indexDir Directory for indexes
   * @param indexName Name of the index
   * @param fileManager File storage manager
   * @param lockManager Lock manager
   */
  constructor(
    indexDir: string,
    indexName: string,
    fileManager: FileStorageManager,
    lockManager: LockManager
  ) {
    this.indexDir = indexDir;
    this.indexName = indexName;
    this.fileManager = fileManager;
    this.lockManager = lockManager;
    this.indexPath = path.join(indexDir, `${indexName}.json`);
  }
  
  /**
   * Initialize the index
   */
  async init(): Promise<void> {
    try {
      // Ensure directory exists
      await this.fileManager.ensureDirectory(this.indexDir);
      
      // Create index file if it doesn't exist
      if (!(await this.fileManager.fileExists(this.indexPath))) {
        await this.fileManager.writeJsonFile(this.indexPath, {});
      }
    } catch (error) {
      console.error(`Error initializing index ${this.indexName}: ${error}`);
      throw new Error(`Failed to initialize index ${this.indexName}`);
    }
  }
  
  /**
   * Add or update an entity in the index
   * @param key Index key
   * @param entityId Entity ID
   * @param options Index options
   */
  async addOrUpdate(key: string, entityId: string, options: IndexOptions = {}): Promise<void> {
    if (!key) {
      return; // Skip empty keys
    }
    
    // Normalize key if case insensitive
    const normalizedKey = options.caseSensitive ? key : key.toLowerCase();
    
    // Acquire lock
    const lock = await this.lockManager.acquireLock(`index:${this.indexName}`);
    
    try {
      const index = await this.getIndex();
      
      if (options.unique) {
        // For unique indexes, remove existing entries with this entity ID
        for (const existingKey of Object.keys(index)) {
          if (index[existingKey].includes(entityId)) {
            index[existingKey] = index[existingKey].filter(id => id !== entityId);
            
            // Clean up empty arrays
            if (index[existingKey].length === 0) {
              delete index[existingKey];
            }
          }
        }
        
        // Remove any existing entity from this key (should be at most one)
        if (index[normalizedKey]) {
          index[normalizedKey] = [];
        }
      }
      
      // Add new entry
      if (!index[normalizedKey]) {
        index[normalizedKey] = [];
      }
      
      // Ensure no duplicates
      if (!index[normalizedKey].includes(entityId)) {
        index[normalizedKey].push(entityId);
      }
      
      // Save index
      await this.saveIndex(index);
    } catch (error) {
      console.error(`Error adding to index ${this.indexName}: ${error}`);
      throw new Error(`Failed to add to index ${this.indexName}`);
    } finally {
      // Release lock
      await this.lockManager.releaseLock(lock);
    }
  }
  
  /**
   * Remove an entity from the index
   * @param entityId Entity ID to remove
   */
  async removeEntity(entityId: string): Promise<void> {
    // Acquire lock
    const lock = await this.lockManager.acquireLock(`index:${this.indexName}`);
    
    try {
      const index = await this.getIndex();
      
      // Remove entity from all keys
      for (const key of Object.keys(index)) {
        if (index[key].includes(entityId)) {
          index[key] = index[key].filter(id => id !== entityId);
          
          // Clean up empty arrays
          if (index[key].length === 0) {
            delete index[key];
          }
        }
      }
      
      // Save index
      await this.saveIndex(index);
    } catch (error) {
      console.error(`Error removing from index ${this.indexName}: ${error}`);
      throw new Error(`Failed to remove from index ${this.indexName}`);
    } finally {
      // Release lock
      await this.lockManager.releaseLock(lock);
    }
  }
  
  /**
   * Remove a specific key-value pair from the index
   * @param key Index key
   * @param entityId Entity ID
   * @param options Index options
   */
  async remove(key: string, entityId: string, options: IndexOptions = {}): Promise<void> {
    if (!key) {
      return; // Skip empty keys
    }
    
    // Normalize key if case insensitive
    const normalizedKey = options.caseSensitive ? key : key.toLowerCase();
    
    // Acquire lock
    const lock = await this.lockManager.acquireLock(`index:${this.indexName}`);
    
    try {
      const index = await this.getIndex();
      
      if (index[normalizedKey]) {
        index[normalizedKey] = index[normalizedKey].filter(id => id !== entityId);
        
        // Clean up empty arrays
        if (index[normalizedKey].length === 0) {
          delete index[normalizedKey];
        }
        
        // Save index
        await this.saveIndex(index);
      }
    } catch (error) {
      console.error(`Error removing from index ${this.indexName}: ${error}`);
      throw new Error(`Failed to remove from index ${this.indexName}`);
    } finally {
      // Release lock
      await this.lockManager.releaseLock(lock);
    }
  }
  
  /**
   * Look up entities by exact key match
   * @param key Index key to look up
   * @param options Index options
   * @returns Array of entity IDs
   */
  async lookupExact(key: string, options: IndexOptions = {}): Promise<string[]> {
    if (!key) {
      return [];
    }
    
    try {
      // Normalize key if case insensitive
      const normalizedKey = options.caseSensitive ? key : key.toLowerCase();
      const index = await this.getIndex();
      
      return index[normalizedKey] || [];
    } catch (error) {
      console.error(`Error looking up in index ${this.indexName}: ${error}`);
      throw new Error(`Failed to look up in index ${this.indexName}`);
    }
  }
  
  /**
   * Look up entities by partial key match
   * @param keyPart Partial key to look up
   * @param options Index options
   * @returns Array of entity IDs
   */
  async lookupPartial(keyPart: string, options: IndexOptions = {}): Promise<string[]> {
    if (!keyPart) {
      return [];
    }
    
    try {
      // Normalize key part if case insensitive
      const normalizedKeyPart = options.caseSensitive ? keyPart : keyPart.toLowerCase();
      const index = await this.getIndex();
      const result = new Set<string>();
      
      for (const key of Object.keys(index)) {
        // Check if key contains the partial key
        if (options.caseSensitive ? key.includes(normalizedKeyPart) : key.toLowerCase().includes(normalizedKeyPart)) {
          index[key].forEach(id => result.add(id));
        }
      }
      
      return Array.from(result);
    } catch (error) {
      console.error(`Error looking up partial in index ${this.indexName}: ${error}`);
      throw new Error(`Failed to look up partial in index ${this.indexName}`);
    }
  }
  
  /**
   * Look up entities by prefix
   * @param prefix Key prefix to look up
   * @param options Index options
   * @returns Array of entity IDs
   */
  async lookupPrefix(prefix: string, options: IndexOptions = {}): Promise<string[]> {
    if (!prefix) {
      return [];
    }
    
    try {
      // Normalize prefix if case insensitive
      const normalizedPrefix = options.caseSensitive ? prefix : prefix.toLowerCase();
      const index = await this.getIndex();
      const result = new Set<string>();
      
      for (const key of Object.keys(index)) {
        // Check if key starts with the prefix
        if (options.caseSensitive ? key.startsWith(normalizedPrefix) : key.toLowerCase().startsWith(normalizedPrefix)) {
          index[key].forEach(id => result.add(id));
        }
      }
      
      return Array.from(result);
    } catch (error) {
      console.error(`Error looking up prefix in index ${this.indexName}: ${error}`);
      throw new Error(`Failed to look up prefix in index ${this.indexName}`);
    }
  }
  
  /**
   * Rebuild the index from a collection of entities
   * @param entities Collection of entities
   * @param keyExtractor Function to extract key from entity
   * @param options Index options
   */
  async rebuildIndex(
    entities: T[],
    keyExtractor: (entity: T) => string | string[],
    idExtractor: (entity: T) => string,
    options: IndexOptions = {}
  ): Promise<void> {
    // Acquire lock
    const lock = await this.lockManager.acquireLock(`index:${this.indexName}`);
    
    try {
      // Create a new index
      const index: Record<string, string[]> = {};
      
      // Add all entities to the index
      for (const entity of entities) {
        const keys = this.extractKeys(entity, keyExtractor);
        const entityId = idExtractor(entity);
        
        for (const key of keys) {
          if (!key) {
            continue; // Skip empty keys
          }
          
          // Normalize key if case insensitive
          const normalizedKey = options.caseSensitive ? key : key.toLowerCase();
          
          if (!index[normalizedKey]) {
            index[normalizedKey] = [];
          }
          
          // For unique indexes, ensure only one entity per key
          if (options.unique) {
            index[normalizedKey] = [entityId];
          } else if (!index[normalizedKey].includes(entityId)) {
            index[normalizedKey].push(entityId);
          }
        }
      }
      
      // Save index
      await this.saveIndex(index);
    } catch (error) {
      console.error(`Error rebuilding index ${this.indexName}: ${error}`);
      throw new Error(`Failed to rebuild index ${this.indexName}`);
    } finally {
      // Release lock
      await this.lockManager.releaseLock(lock);
    }
  }
  
  /**
   * Get all keys in the index
   * @returns Array of all keys
   */
  async getAllKeys(): Promise<string[]> {
    try {
      const index = await this.getIndex();
      return Object.keys(index);
    } catch (error) {
      console.error(`Error getting all keys from index ${this.indexName}: ${error}`);
      throw new Error(`Failed to get all keys from index ${this.indexName}`);
    }
  }
  
  /**
   * Get index data
   * @returns Index data
   */
  async getIndex(): Promise<Record<string, string[]>> {
    try {
      // Use cached index if available
      if (this.cachedIndex) {
        return this.cachedIndex;
      }
      
      await this.init();
      const data = await this.fileManager.readJsonFile<Record<string, string[]>>(this.indexPath);
      this.cachedIndex = data || {};
      return this.cachedIndex;
    } catch (error) {
      console.error(`Error getting index ${this.indexName}: ${error}`);
      return {};
    }
  }
  
  /**
   * Save index data
   * @param index Index data
   */
  private async saveIndex(index: Record<string, string[]>): Promise<void> {
    try {
      await this.fileManager.writeJsonFile(this.indexPath, index);
      this.cachedIndex = index;
    } catch (error) {
      console.error(`Error saving index ${this.indexName}: ${error}`);
      throw new Error(`Failed to save index ${this.indexName}`);
    }
  }
  
  /**
   * Extract keys from an entity
   * @param entity Entity
   * @param keyExtractor Function to extract keys
   * @returns Array of keys
   */
  private extractKeys(entity: T, keyExtractor: (entity: T) => string | string[]): string[] {
    const keys = keyExtractor(entity);
    return Array.isArray(keys) ? keys : [keys];
  }
  
  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cachedIndex = null;
  }
}
