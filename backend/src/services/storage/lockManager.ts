/**
 * Lock Manager
 * 
 * Service for managing file locks to handle concurrent operations.
 * Implements a lock acquisition and release mechanism with timeouts and deadlock prevention.
 */
import path from 'path';
import fs from 'fs/promises';

export interface FileLock {
  id: string;
  resourceId: string;
  acquiredAt: Date;
  expiresAt: Date;
}

export class LockManager {
  private locks: Map<string, FileLock> = new Map();
  private lockQueue: Map<string, Array<() => void>> = new Map();
  private lockDirectory: string;
  private readonly lockExpiryTime: number = 30000; // 30 seconds
  
  /**
   * Constructor
   * @param lockDirectory Directory to store lock files
   */
  constructor(lockDirectory: string) {
    this.lockDirectory = lockDirectory;
    this.initLockDirectory();
    
    // Start cleanup interval for expired locks
    setInterval(() => this.cleanupExpiredLocks(), 5000);
  }
  
  /**
   * Initialize lock directory
   */
  private async initLockDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.lockDirectory, { recursive: true });
    } catch (error) {
      console.error(`Error initializing lock directory: ${error}`);
    }
  }
  
  /**
   * Get the lock file path
   * @param resourceId Resource ID
   * @returns Path to lock file
   */
  private getLockFilePath(resourceId: string): string {
    const sanitizedId = resourceId.replace(/[^a-zA-Z0-9]/g, '_');
    return path.join(this.lockDirectory, `${sanitizedId}.lock`);
  }
  
  /**
   * Acquire a lock for a resource
   * @param resourceId Resource ID to lock
   * @param timeout Maximum time to wait for lock (ms)
   * @returns Promise resolving to a FileLock
   */
  async acquireLock(resourceId: string, timeout = 5000): Promise<FileLock> {
    const lockFilePath = this.getLockFilePath(resourceId);
    
    // Check if lock already exists in memory
    if (this.locks.has(resourceId)) {
      const existingLock = this.locks.get(resourceId)!;
      
      // Check if lock has expired
      if (existingLock.expiresAt > new Date()) {
        // Lock is still valid, wait for it to be released
        return this.waitForLock(resourceId, timeout);
      } else {
        // Lock has expired, release it and acquire a new one
        this.releaseLock(existingLock);
      }
    }
    
    // Try to acquire the lock file
    try {
      // Check if lock file exists and is recent
      try {
        const lockFileStats = await fs.stat(lockFilePath);
        const lockFileAge = Date.now() - lockFileStats.mtime.getTime();
        
        if (lockFileAge < this.lockExpiryTime) {
          // Lock file exists and is recent, wait for it to be released
          return this.waitForLock(resourceId, timeout);
        }
        
        // Lock file exists but is old, remove it
        await fs.unlink(lockFilePath);
      } catch (error) {
        // Lock file doesn't exist, continue to create it
      }
      
      // Create the lock file
      const now = new Date();
      const expiresAt = new Date(now.getTime() + this.lockExpiryTime);
      const lockData = {
        id: Math.random().toString(36).substring(2, 15),
        resourceId,
        acquiredAt: now.toISOString(),
        expiresAt: expiresAt.toISOString()
      };
      
      await fs.writeFile(lockFilePath, JSON.stringify(lockData));
      
      // Create in-memory lock
      const lock: FileLock = {
        id: lockData.id,
        resourceId,
        acquiredAt: now,
        expiresAt
      };
      
      this.locks.set(resourceId, lock);
      return lock;
    } catch (error) {
      console.error(`Error acquiring lock for resource ${resourceId}: ${error}`);
      throw new Error(`Failed to acquire lock for resource ${resourceId}`);
    }
  }
  
  /**
   * Wait for a lock to be released
   * @param resourceId Resource ID
   * @param timeout Maximum time to wait (ms)
   * @returns Promise resolving to a FileLock
   */
  private waitForLock(resourceId: string, timeout: number): Promise<FileLock> {
    return new Promise((resolve, reject) => {
      // Add to queue
      if (!this.lockQueue.has(resourceId)) {
        this.lockQueue.set(resourceId, []);
      }
      
      const queueItem = () => {
        this.acquireLock(resourceId, timeout)
          .then(resolve)
          .catch(reject);
      };
      
      this.lockQueue.get(resourceId)!.push(queueItem);
      
      // Set timeout
      const timeoutId = setTimeout(() => {
        // Remove from queue
        const queue = this.lockQueue.get(resourceId) || [];
        const index = queue.indexOf(queueItem);
        if (index !== -1) {
          queue.splice(index, 1);
        }
        
        reject(new Error(`Timeout acquiring lock for resource ${resourceId}`));
      }, timeout);
    });
  }
  
  /**
   * Release a lock
   * @param lock Lock to release
   */
  async releaseLock(lock: FileLock): Promise<void> {
    try {
      const { resourceId } = lock;
      
      // Remove from memory
      this.locks.delete(resourceId);
      
      // Remove lock file
      const lockFilePath = this.getLockFilePath(resourceId);
      try {
        await fs.unlink(lockFilePath);
      } catch (error) {
        // Ignore if file doesn't exist
      }
      
      // Process queue
      const queue = this.lockQueue.get(resourceId);
      if (queue && queue.length > 0) {
        const next = queue.shift();
        if (next) {
          setTimeout(next, 0);
        }
        
        if (queue.length === 0) {
          this.lockQueue.delete(resourceId);
        }
      }
    } catch (error) {
      console.error(`Error releasing lock: ${error}`);
    }
  }
  
  /**
   * Check if a resource is locked
   * @param resourceId Resource ID
   * @returns True if locked, false otherwise
   */
  isLocked(resourceId: string): boolean {
    if (!this.locks.has(resourceId)) {
      return false;
    }
    
    const lock = this.locks.get(resourceId)!;
    return lock.expiresAt > new Date();
  }
  
  /**
   * Clean up expired locks
   */
  private async cleanupExpiredLocks(): Promise<void> {
    const now = new Date();
    
    // Check in-memory locks
    for (const [resourceId, lock] of this.locks.entries()) {
      if (lock.expiresAt <= now) {
        await this.releaseLock(lock);
      }
    }
    
    // Check lock files
    try {
      const files = await fs.readdir(this.lockDirectory);
      for (const file of files) {
        if (file.endsWith('.lock')) {
          const lockFilePath = path.join(this.lockDirectory, file);
          try {
            const stats = await fs.stat(lockFilePath);
            const lockFileAge = now.getTime() - stats.mtime.getTime();
            
            if (lockFileAge > this.lockExpiryTime) {
              await fs.unlink(lockFilePath);
            }
          } catch (error) {
            // Ignore errors
          }
        }
      }
    } catch (error) {
      console.error(`Error cleaning up expired locks: ${error}`);
    }
  }
}
