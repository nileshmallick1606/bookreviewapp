/**
 * Base Storage Service
 * 
 * Abstract base class for all file-based storage operations.
 * Provides common functionality for CRUD operations on JSON files.
 */
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Type for entities with required ID field
export interface BaseEntity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

export abstract class BaseStorageService<T extends BaseEntity> {
  protected readonly dataDir: string;
  protected readonly fileExt: string = '.json';
  
  /**
   * Constructor
   * @param dataDir Path to the directory for storing entity files
   */
  constructor(dataDir: string) {
    this.dataDir = dataDir;
  }
  
  /**
   * Initialize the storage by ensuring directories exist
   */
  protected async initStorage(): Promise<void> {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      console.error(`Error initializing storage: ${error}`);
      throw new Error(`Failed to initialize storage for ${this.dataDir}`);
    }
  }
  
  /**
   * Get the absolute file path for an entity
   * @param id Entity ID
   * @returns Absolute file path
   */
  protected getFilePath(id: string): string {
    return path.resolve(this.dataDir, `${id}${this.fileExt}`);
  }
  
  /**
   * Check if an entity exists
   * @param id Entity ID
   * @returns True if entity exists, false otherwise
   */
  async exists(id: string): Promise<boolean> {
    try {
      await this.initStorage();
      await fs.access(this.getFilePath(id));
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Get an entity by ID
   * @param id Entity ID
   * @returns Entity or null if not found
   */
  async getById(id: string): Promise<T | null> {
    try {
      await this.initStorage();
      
      if (!(await this.exists(id))) {
        return null;
      }
      
      const data = await fs.readFile(this.getFilePath(id), 'utf-8');
      return JSON.parse(data) as T;
    } catch (error) {
      console.error(`Error getting entity by ID ${id}: ${error}`);
      throw new Error(`Failed to get entity with ID ${id}`);
    }
  }
  
  /**
   * Create a new entity
   * @param entityData Entity data (without id, createdAt, updatedAt)
   * @returns Created entity with id and timestamps
   */
  async create(entityData: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    try {
      await this.initStorage();
      
      const now = new Date().toISOString();
      const entity = {
        ...entityData as any,
        id: uuidv4(),
        createdAt: now,
        updatedAt: now
      } as T;
      
      await this.validateEntity(entity);
      
      const filePath = this.getFilePath(entity.id);
      await fs.writeFile(filePath, JSON.stringify(entity, null, 2));
      
      return entity;
    } catch (error) {
      console.error(`Error creating entity: ${error}`);
      throw new Error('Failed to create entity');
    }
  }
  
  /**
   * Update an existing entity
   * @param id Entity ID
   * @param updates Partial entity data to update
   * @returns Updated entity
   */
  async update(id: string, updates: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<T> {
    try {
      await this.initStorage();
      
      const entity = await this.getById(id);
      if (!entity) {
        throw new Error(`Entity with ID ${id} not found`);
      }
      
      const updatedEntity = {
        ...entity,
        ...updates,
        updatedAt: new Date().toISOString()
      } as T;
      
      await this.validateEntity(updatedEntity);
      
      const filePath = this.getFilePath(id);
      await fs.writeFile(filePath, JSON.stringify(updatedEntity, null, 2));
      
      return updatedEntity;
    } catch (error) {
      console.error(`Error updating entity with ID ${id}: ${error}`);
      throw new Error(`Failed to update entity with ID ${id}`);
    }
  }
  
  /**
   * Delete an entity
   * @param id Entity ID
   * @returns True if deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    try {
      await this.initStorage();
      
      if (!(await this.exists(id))) {
        return false;
      }
      
      const filePath = this.getFilePath(id);
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error(`Error deleting entity with ID ${id}: ${error}`);
      throw new Error(`Failed to delete entity with ID ${id}`);
    }
  }
  
  /**
   * Get all entities
   * @returns Array of entities
   */
  async getAll(): Promise<T[]> {
    try {
      await this.initStorage();
      
      const files = await fs.readdir(this.dataDir);
      const entityFiles = files.filter(file => file.endsWith(this.fileExt));
      
      const entities: T[] = [];
      for (const file of entityFiles) {
        const id = path.basename(file, this.fileExt);
        const entity = await this.getById(id);
        if (entity) {
          entities.push(entity);
        }
      }
      
      return entities;
    } catch (error) {
      console.error(`Error getting all entities: ${error}`);
      throw new Error('Failed to get all entities');
    }
  }
  
  /**
   * Validate an entity before saving
   * @param entity Entity to validate
   */
  protected abstract validateEntity(entity: T): Promise<void>;
}
