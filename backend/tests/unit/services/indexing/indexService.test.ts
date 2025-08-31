/**
 * Index Service Tests
 */
import path from 'path';
import fs from 'fs';
import { IndexService, IndexOptions } from '../../../../src/services/indexing/index.service';
import { FileStorageManager } from '../../../../src/services/storage/fileStorageManager';
import { LockManager } from '../../../../src/services/storage/lockManager';
import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';

interface TestEntity {
  id: string;
  name: string;
  category: string;
  tags: string[];
}

describe('IndexService', () => {
  const testDir = path.join(__dirname, 'test-indexes');
  const indexName = 'test-index';
  let indexService: IndexService<TestEntity>;
  let fileManager: FileStorageManager;
  let lockManager: LockManager;

  beforeEach(async () => {
    // Create test directory if it doesn't exist
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    
    fileManager = new FileStorageManager();
    lockManager = new LockManager(path.join(testDir, 'locks'));
    indexService = new IndexService<TestEntity>(testDir, indexName, fileManager, lockManager);
    
    // Initialize the index
    await indexService.init();
  });

  afterEach(async () => {
    // Clean up test files
    if (fs.existsSync(testDir)) {
      const files = fs.readdirSync(testDir);
      for (const file of files) {
        fs.unlinkSync(path.join(testDir, file));
      }
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('addOrUpdate', () => {
    it('should add an entry to the index', async () => {
      const key = 'testKey';
      const entityId = 'entity1';
      
      await indexService.addOrUpdate(key, entityId);
      
      const result = await indexService.lookupExact(key);
      expect(result).toContain(entityId);
    });

    it('should handle case sensitivity option', async () => {
      const key = 'TestKey';
      const entityId = 'entity1';
      
      // Add with case sensitive option
      await indexService.addOrUpdate(key, entityId, { caseSensitive: true });
      
      // Look up with exact same case
      let result = await indexService.lookupExact(key, { caseSensitive: true });
      expect(result).toContain(entityId);
      
      // Look up with different case
      result = await indexService.lookupExact('testkey', { caseSensitive: true });
      expect(result).not.toContain(entityId);
    });

    it('should enforce unique option', async () => {
      const key = 'uniqueKey';
      const entity1 = 'entity1';
      const entity2 = 'entity2';
      
      // Add first entity with unique option
      await indexService.addOrUpdate(key, entity1, { unique: true });
      
      // Add second entity with same key and unique option
      await indexService.addOrUpdate(key, entity2, { unique: true });
      
      // Check that only the second entity is associated with the key
      const result = await indexService.lookupExact(key);
      expect(result).toContain(entity2);
      expect(result).not.toContain(entity1);
    });
  });

  describe('remove', () => {
    it('should remove an entity from the index', async () => {
      const key = 'testKey';
      const entityId = 'entity1';
      
      // Add entity to index
      await indexService.addOrUpdate(key, entityId);
      
      // Remove entity
      await indexService.remove(key, entityId);
      
      // Check that entity is removed
      const result = await indexService.lookupExact(key);
      expect(result).not.toContain(entityId);
    });
  });

  describe('removeEntity', () => {
    it('should remove an entity from all keys', async () => {
      const entityId = 'entity1';
      
      // Add entity to multiple keys
      await indexService.addOrUpdate('key1', entityId);
      await indexService.addOrUpdate('key2', entityId);
      await indexService.addOrUpdate('key3', entityId);
      
      // Remove entity from all keys
      await indexService.removeEntity(entityId);
      
      // Check that entity is removed from all keys
      const result1 = await indexService.lookupExact('key1');
      const result2 = await indexService.lookupExact('key2');
      const result3 = await indexService.lookupExact('key3');
      
      expect(result1).not.toContain(entityId);
      expect(result2).not.toContain(entityId);
      expect(result3).not.toContain(entityId);
    });
  });

  describe('lookup methods', () => {
    beforeEach(async () => {
      // Add test data
      await indexService.addOrUpdate('apple', 'entity1');
      await indexService.addOrUpdate('banana', 'entity2');
      await indexService.addOrUpdate('applejuice', 'entity3');
      await indexService.addOrUpdate('orange', 'entity4');
    });

    it('lookupExact should find exact matches', async () => {
      const result = await indexService.lookupExact('apple');
      expect(result).toContain('entity1');
      expect(result).not.toContain('entity3');
    });

    it('lookupPartial should find partial matches', async () => {
      const result = await indexService.lookupPartial('apple');
      expect(result).toContain('entity1'); // 'apple'
      expect(result).toContain('entity3'); // 'applejuice'
      expect(result).not.toContain('entity2'); // 'banana'
    });

    it('lookupPrefix should find prefix matches', async () => {
      const result = await indexService.lookupPrefix('app');
      expect(result).toContain('entity1'); // 'apple'
      expect(result).toContain('entity3'); // 'applejuice'
      expect(result).not.toContain('entity2'); // 'banana'
    });
  });

  describe('rebuildIndex', () => {
    it('should rebuild the index from a collection of entities', async () => {
      const entities: TestEntity[] = [
        { id: 'entity1', name: 'Entity 1', category: 'A', tags: ['tag1', 'tag2'] },
        { id: 'entity2', name: 'Entity 2', category: 'B', tags: ['tag2', 'tag3'] },
        { id: 'entity3', name: 'Entity 3', category: 'A', tags: ['tag1', 'tag3'] }
      ];
      
      // Extract category as key
      await indexService.rebuildIndex(
        entities,
        (entity) => entity.category,
        (entity) => entity.id
      );
      
      // Check that index was built correctly
      const categoryA = await indexService.lookupExact('A');
      const categoryB = await indexService.lookupExact('B');
      
      expect(categoryA).toContain('entity1');
      expect(categoryA).toContain('entity3');
      expect(categoryA).not.toContain('entity2');
      
      expect(categoryB).toContain('entity2');
      expect(categoryB).not.toContain('entity1');
      expect(categoryB).not.toContain('entity3');
    });

    it('should handle arrays of keys', async () => {
      const entities: TestEntity[] = [
        { id: 'entity1', name: 'Entity 1', category: 'A', tags: ['tag1', 'tag2'] },
        { id: 'entity2', name: 'Entity 2', category: 'B', tags: ['tag2', 'tag3'] },
        { id: 'entity3', name: 'Entity 3', category: 'A', tags: ['tag1', 'tag3'] }
      ];
      
      // Extract tags as keys
      await indexService.rebuildIndex(
        entities,
        (entity) => entity.tags,
        (entity) => entity.id
      );
      
      // Check that index was built correctly
      const tag1Results = await indexService.lookupExact('tag1');
      const tag2Results = await indexService.lookupExact('tag2');
      const tag3Results = await indexService.lookupExact('tag3');
      
      expect(tag1Results).toContain('entity1');
      expect(tag1Results).toContain('entity3');
      expect(tag1Results).not.toContain('entity2');
      
      expect(tag2Results).toContain('entity1');
      expect(tag2Results).toContain('entity2');
      expect(tag2Results).not.toContain('entity3');
      
      expect(tag3Results).toContain('entity2');
      expect(tag3Results).toContain('entity3');
      expect(tag3Results).not.toContain('entity1');
    });
  });
});
