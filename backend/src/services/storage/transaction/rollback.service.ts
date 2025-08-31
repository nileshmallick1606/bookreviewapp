/**
 * Rollback Service
 * 
 * Provides rollback capabilities for failed transactions.
 * Manages backup files and recovery process.
 */
import fs from 'fs/promises';
import path from 'path';
import { FileStorageManager } from '../fileStorageManager';

export interface RollbackOperation {
  filePath: string;
  backupPath: string;
}

export class RollbackService {
  private fileManager: FileStorageManager;
  private rollbackDirectory: string;
  
  /**
   * Constructor
   * @param fileManager File storage manager instance
   * @param rollbackDirectory Directory to store rollback files
   */
  constructor(fileManager: FileStorageManager, rollbackDirectory: string) {
    this.fileManager = fileManager;
    this.rollbackDirectory = rollbackDirectory;
    this.initRollbackDirectory();
  }
  
  /**
   * Initialize rollback directory
   */
  private async initRollbackDirectory(): Promise<void> {
    try {
      await this.fileManager.ensureDirectory(this.rollbackDirectory);
    } catch (error) {
      console.error(`Error initializing rollback directory: ${error}`);
    }
  }
  
  /**
   * Create a backup for rollback
   * @param filePath Path to original file
   * @returns Path to backup file or undefined if file doesn't exist
   */
  async createBackup(filePath: string): Promise<string | undefined> {
    try {
      // Check if file exists
      if (!(await this.fileManager.fileExists(filePath))) {
        return undefined;
      }
      
      // Create backup filename
      const filename = path.basename(filePath);
      const timestamp = Date.now();
      const backupPath = path.join(
        this.rollbackDirectory,
        `${filename}.${timestamp}.bak`
      );
      
      // Copy file to backup location
      await fs.copyFile(filePath, backupPath);
      return backupPath;
    } catch (error) {
      console.error(`Error creating backup for ${filePath}: ${error}`);
      throw new Error(`Failed to create backup for ${filePath}`);
    }
  }
  
  /**
   * Restore from backup
   * @param backupPath Path to backup file
   * @param originalPath Path to restore to
   * @returns True if restored, false otherwise
   */
  async restoreFromBackup(backupPath: string, originalPath: string): Promise<boolean> {
    try {
      if (!(await this.fileManager.fileExists(backupPath))) {
        return false;
      }
      
      // Ensure directory exists
      await this.fileManager.ensureDirectory(path.dirname(originalPath));
      
      // Copy backup to original location
      await fs.copyFile(backupPath, originalPath);
      return true;
    } catch (error) {
      console.error(`Error restoring from backup ${backupPath}: ${error}`);
      throw new Error(`Failed to restore from backup ${backupPath}`);
    }
  }
  
  /**
   * Delete a backup file
   * @param backupPath Path to backup file
   */
  async deleteBackup(backupPath: string): Promise<void> {
    try {
      await this.fileManager.deleteFile(backupPath);
    } catch (error) {
      console.error(`Error deleting backup ${backupPath}: ${error}`);
      // Don't throw, just log the error
    }
  }
  
  /**
   * Clean up old backup files
   * @param maxAge Maximum age of backup files in milliseconds
   */
  async cleanupOldBackups(maxAge: number = 24 * 60 * 60 * 1000): Promise<void> {
    try {
      // Get all backup files
      const files = await this.fileManager.listFiles(
        this.rollbackDirectory,
        (file) => file.endsWith('.bak')
      );
      
      const now = Date.now();
      
      // Check each file's age
      for (const file of files) {
        const filePath = path.join(this.rollbackDirectory, file);
        
        try {
          const stats = await fs.stat(filePath);
          const fileAge = now - stats.mtime.getTime();
          
          if (fileAge > maxAge) {
            await this.fileManager.deleteFile(filePath);
          }
        } catch (error) {
          console.error(`Error processing backup file ${filePath}: ${error}`);
          // Continue with next file
        }
      }
    } catch (error) {
      console.error(`Error cleaning up old backups: ${error}`);
    }
  }
}
