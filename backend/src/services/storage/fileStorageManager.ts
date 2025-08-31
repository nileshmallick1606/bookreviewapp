/**
 * File Storage Manager
 * 
 * Central service for file operations and management.
 * Handles common file operations with error handling and logging.
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

export class FileStorageManager {
  /**
   * Check if a file exists
   * @param filePath Path to file
   * @returns True if file exists, false otherwise
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Ensure a directory exists
   * @param dirPath Path to directory
   */
  async ensureDirectory(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      console.error(`Error creating directory ${dirPath}: ${error}`);
      throw new Error(`Failed to create directory ${dirPath}`);
    }
  }
  
  /**
   * Read a JSON file
   * @param filePath Path to file
   * @returns Parsed JSON content
   */
  async readJsonFile<T>(filePath: string): Promise<T | null> {
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data) as T;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      console.error(`Error reading JSON file ${filePath}: ${error}`);
      throw new Error(`Failed to read JSON file ${filePath}`);
    }
  }
  
  /**
   * Write a JSON file
   * @param filePath Path to file
   * @param data Data to write
   */
  async writeJsonFile<T>(filePath: string, data: T): Promise<void> {
    try {
      // Ensure the directory exists
      const dirPath = path.dirname(filePath);
      await this.ensureDirectory(dirPath);
      
      // Write the file
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Error writing JSON file ${filePath}: ${error}`);
      throw new Error(`Failed to write JSON file ${filePath}`);
    }
  }
  
  /**
   * Delete a file
   * @param filePath Path to file
   * @returns True if deleted, false if not found
   */
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return false;
      }
      console.error(`Error deleting file ${filePath}: ${error}`);
      throw new Error(`Failed to delete file ${filePath}`);
    }
  }
  
  /**
   * List files in a directory
   * @param dirPath Path to directory
   * @param filter Optional filter function
   * @returns Array of file names
   */
  async listFiles(dirPath: string, filter?: (fileName: string) => boolean): Promise<string[]> {
    try {
      await this.ensureDirectory(dirPath);
      let files = await fs.readdir(dirPath);
      
      if (filter) {
        files = files.filter(filter);
      }
      
      return files;
    } catch (error) {
      console.error(`Error listing files in directory ${dirPath}: ${error}`);
      throw new Error(`Failed to list files in directory ${dirPath}`);
    }
  }
  
  /**
   * Create a backup of a file
   * @param filePath Path to file
   * @returns Path to backup file
   */
  async createBackup(filePath: string): Promise<string | null> {
    try {
      if (!(await this.fileExists(filePath))) {
        return null;
      }
      
      const backupPath = `${filePath}.bak`;
      await fs.copyFile(filePath, backupPath);
      return backupPath;
    } catch (error) {
      console.error(`Error creating backup of file ${filePath}: ${error}`);
      throw new Error(`Failed to create backup of file ${filePath}`);
    }
  }
  
  /**
   * Restore a file from backup
   * @param backupPath Path to backup file
   * @param originalPath Original file path
   */
  async restoreFromBackup(backupPath: string, originalPath: string): Promise<boolean> {
    try {
      if (!(await this.fileExists(backupPath))) {
        return false;
      }
      
      await fs.copyFile(backupPath, originalPath);
      await fs.unlink(backupPath);
      return true;
    } catch (error) {
      console.error(`Error restoring from backup ${backupPath}: ${error}`);
      throw new Error(`Failed to restore from backup ${backupPath}`);
    }
  }
}
