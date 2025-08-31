/**
 * Base Storage Service Tests
 */
import path from 'path';
import fs from 'fs';
import { BaseStorageService, BaseEntity } from '../../../../src/services/storage/baseStorage.service';
import { FileStorageManager } from '../../../../src/services/storage/fileStorageManager';
// Add Jest imports
import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';

// Test entity extending BaseEntity
interface TestEntity extends BaseEntity {
  name: string;
  value: number;
}

// Concrete implementation of BaseStorageService for testing
class TestStorageService extends BaseStorageService<TestEntity> {
  constructor(dataDir: string) {
    super(dataDir);
  }

  protected async validateEntity(entity: TestEntity): Promise<void> {
    if (!entity.name) {
      throw new Error('Name is required');
    }
    if (typeof entity.value !== 'number') {
      throw new Error('Value must be a number');
    }
  }
}

describe('BaseStorageService', () => {
  const testDir = path.join(__dirname, 'test-storage');
  let storageService: TestStorageService;
  let fileManager: FileStorageManager;

  beforeEach(async () => {
    // Create test directory if it doesn't exist
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    
    fileManager = new FileStorageManager();
    storageService = new TestStorageService(testDir);
  });

  afterEach(async () => {
    // Clean up test files
    if (fs.existsSync(testDir)) {
      const files = fs.readdirSync(testDir);
      for (const file of files) {
        fs.unlinkSync(path.join(testDir, file));
      }
      // Use fs.rmSync instead of deprecated recursive option
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('create', () => {
    it('should create a new entity with ID and timestamps', async () => {
      const entityData = {
        name: 'Test Entity',
        value: 42
      };
      
      const created = await storageService.create(entityData);
      
      expect(created.id).toBeDefined();
      expect(created.name).toBe(entityData.name);
      expect(created.value).toBe(entityData.value);
      expect(created.createdAt).toBeDefined();
      expect(created.updatedAt).toBeDefined();
      
      // Check that the file was created
      const filePath = path.join(testDir, `${created.id}.json`);
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it('should throw error if validation fails', async () => {
      const invalidEntity = {
        name: '', // Empty name
        value: 42
      };
      
      await expect(storageService.create(invalidEntity)).rejects.toThrow('Name is required');
    });
  });

  describe('getById', () => {
    it('should return entity by ID', async () => {
      // Create test entity
      const entityData = {
        name: 'Test Entity',
        value: 42
      };
      const created = await storageService.create(entityData);
      
      // Get entity by ID
      const retrieved = await storageService.getById(created.id);
      
      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.name).toBe(created.name);
      expect(retrieved?.value).toBe(created.value);
    });

    it('should return null if entity does not exist', async () => {
      const nonExistentId = 'non-existent-id';
      
      const entity = await storageService.getById(nonExistentId);
      
      expect(entity).toBeNull();
    });
  });

  describe('update', () => {
    it('should update entity', async () => {
      // Create test entity
      const entityData = {
        name: 'Test Entity',
        value: 42
      };
      const created = await storageService.create(entityData);
      
      // Update entity
      const updates = {
        name: 'Updated Entity',
        value: 99
      };
      const updated = await storageService.update(created.id, updates);
      
      expect(updated.id).toBe(created.id);
      expect(updated.name).toBe(updates.name);
      expect(updated.value).toBe(updates.value);
      expect(updated.createdAt).toBe(created.createdAt);
      expect(updated.updatedAt).not.toBe(created.updatedAt);
      
      // Check that file was updated
      const filePath = path.join(testDir, `${created.id}.json`);
      const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      expect(fileContent.name).toBe(updates.name);
      expect(fileContent.value).toBe(updates.value);
    });

    it('should throw error if entity does not exist', async () => {
      const nonExistentId = 'non-existent-id';
      const updates = {
        name: 'Updated Entity',
        value: 99
      };
      
      await expect(storageService.update(nonExistentId, updates)).rejects.toThrow();
    });

    it('should throw error if validation fails', async () => {
      // Create test entity
      const entityData = {
        name: 'Test Entity',
        value: 42
      };
      const created = await storageService.create(entityData);
      
      // Try to update with invalid data
      const invalidUpdates = {
        name: '' // Empty name
      };
      
      await expect(storageService.update(created.id, invalidUpdates)).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete entity', async () => {
      // Create test entity
      const entityData = {
        name: 'Test Entity',
        value: 42
      };
      const created = await storageService.create(entityData);
      
      // Delete entity
      const deleted = await storageService.delete(created.id);
      
      expect(deleted).toBe(true);
      
      // Check that file was deleted
      const filePath = path.join(testDir, `${created.id}.json`);
      expect(fs.existsSync(filePath)).toBe(false);
      
      // Check that entity no longer exists
      const entity = await storageService.getById(created.id);
      expect(entity).toBeNull();
    });

    it('should return false if entity does not exist', async () => {
      const nonExistentId = 'non-existent-id';
      
      const deleted = await storageService.delete(nonExistentId);
      
      expect(deleted).toBe(false);
    });
  });

  describe('getAll', () => {
    it('should return all entities', async () => {
      // Create test entities
      const entity1 = await storageService.create({ name: 'Entity 1', value: 1 });
      const entity2 = await storageService.create({ name: 'Entity 2', value: 2 });
      const entity3 = await storageService.create({ name: 'Entity 3', value: 3 });
      
      // Get all entities
      const entities = await storageService.getAll();
      
      expect(entities).toHaveLength(3);
      expect(entities.map(e => e.id)).toContain(entity1.id);
      expect(entities.map(e => e.id)).toContain(entity2.id);
      expect(entities.map(e => e.id)).toContain(entity3.id);
    });

    it('should return empty array if no entities exist', async () => {
      const entities = await storageService.getAll();
      
      expect(entities).toHaveLength(0);
    });
  });
});
