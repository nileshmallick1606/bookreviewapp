/**
 * Lock Manager Tests
 */
import fs from 'fs';
import path from 'path';
import { LockManager, FileLock } from '../../../../src/services/storage/lockManager';
import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';

describe('LockManager', () => {
  const testDir = path.join(__dirname, 'test-locks');
  let lockManager: LockManager;

  beforeEach(() => {
    // Create test directory if it doesn't exist
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    
    lockManager = new LockManager(testDir);
  });

  afterEach(() => {
    // Clean up test lock files
    if (fs.existsSync(testDir)) {
      const files = fs.readdirSync(testDir);
      for (const file of files) {
        fs.unlinkSync(path.join(testDir, file));
      }
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('acquireLock', () => {
    it('should acquire a lock and return lock info', async () => {
      const lockId = 'test-resource';
      
      const lockInfo = await lockManager.acquireLock(lockId);
      
      expect(lockInfo).toBeDefined();
      expect(lockInfo.resourceId).toBe(lockId);
      expect(lockInfo.id).toBeDefined();
      expect(lockInfo.acquiredAt).toBeDefined();
      expect(lockInfo.expiresAt).toBeDefined();
      
      // Check that the lock file exists
      const lockFilePath = path.join(testDir, `${lockId}.lock`);
      expect(fs.existsSync(lockFilePath)).toBe(true);
    });

    it('should wait for lock to be released if already locked', async () => {
      const lockId = 'test-resource';
      
      // Acquire first lock
      const lock1 = await lockManager.acquireLock(lockId);
      
      // Start a timer
      const startTime = Date.now();
      
      // Release the lock after 100ms
      setTimeout(() => {
        lockManager.releaseLock(lock1);
      }, 100);
      
      // Try to acquire the lock again
      const lock2 = await lockManager.acquireLock(lockId, 1000);
      
      // Check that some time has passed (waited for release)
      const elapsed = Date.now() - startTime;
      expect(elapsed).toBeGreaterThanOrEqual(100);
      
      expect(lock2).toBeDefined();
      expect(lock2.id).toBe(lockId);
    });

    it('should throw error if timeout is exceeded', async () => {
      const lockId = 'test-resource';
      
      // Acquire first lock
      const lock1 = await lockManager.acquireLock(lockId);
      
      // Try to acquire the lock again with a short timeout
      await expect(lockManager.acquireLock(lockId, 50)).rejects.toThrow();
      
      // Clean up
      await lockManager.releaseLock(lock1);
    });
  });

  describe('releaseLock', () => {
    it('should release a lock', async () => {
      const lockId = 'test-resource';
      
      // Acquire lock
      const lockInfo = await lockManager.acquireLock(lockId);
      
      // Get lock file path
      const lockFilePath = path.join(testDir, `${lockId}.lock`);
      
      // Release lock
      await lockManager.releaseLock(lockInfo);
      
      // Check that lock file is removed
      expect(fs.existsSync(lockFilePath)).toBe(false);
    });

    it('should not throw error if lock does not exist', async () => {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 30000);
      
      const nonExistentLock: FileLock = {
        id: 'non-existent',
        resourceId: 'non-existent-resource',
        acquiredAt: now,
        expiresAt: expiresAt
      };
      
      await expect(lockManager.releaseLock(nonExistentLock)).resolves.not.toThrow();
    });
  });
});
