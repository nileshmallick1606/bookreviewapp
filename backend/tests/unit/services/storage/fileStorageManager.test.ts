/**
 * File Storage Manager Tests
 */
import fs from 'fs';
import path from 'path';
import { FileStorageManager } from '../../../../src/services/storage/fileStorageManager';
// Add Jest imports
import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';

describe('FileStorageManager', () => {
  const testDir = path.join(__dirname, 'test-files');
  const testFilePath = path.join(testDir, 'test-file.json');
  const testData = { test: 'data', num: 123 };
  let fileManager: FileStorageManager;

  beforeEach(async () => {
    fileManager = new FileStorageManager();
    
    // Create test directory if it doesn't exist
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterEach(async () => {
    // Clean up test files
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
    
    // Remove test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('ensureDirectory', () => {
    it('should create directory if it does not exist', async () => {
      const dirPath = path.join(testDir, 'new-dir');
      
      await fileManager.ensureDirectory(dirPath);
      
      expect(fs.existsSync(dirPath)).toBe(true);
    });

    it('should not throw error if directory already exists', async () => {
      const dirPath = path.join(testDir);
      
      await expect(fileManager.ensureDirectory(dirPath)).resolves.not.toThrow();
    });
  });

  describe('fileExists', () => {
    it('should return true if file exists', async () => {
      // Create test file
      fs.writeFileSync(testFilePath, JSON.stringify(testData));
      
      const exists = await fileManager.fileExists(testFilePath);
      
      expect(exists).toBe(true);
    });

    it('should return false if file does not exist', async () => {
      const nonExistentFile = path.join(testDir, 'non-existent.json');
      
      const exists = await fileManager.fileExists(nonExistentFile);
      
      expect(exists).toBe(false);
    });
  });

  describe('readJsonFile', () => {
    it('should read and parse JSON file', async () => {
      // Create test file
      fs.writeFileSync(testFilePath, JSON.stringify(testData));
      
      const data = await fileManager.readJsonFile(testFilePath);
      
      expect(data).toEqual(testData);
    });

    it('should return null if file does not exist', async () => {
      const nonExistentFile = path.join(testDir, 'non-existent.json');
      
      const data = await fileManager.readJsonFile(nonExistentFile);
      
      expect(data).toBeNull();
    });

    // This test has been removed as the readJsonFile method now returns null for non-existent files
    // instead of throwing an error
  });

  describe('writeJsonFile', () => {
    it('should write data to JSON file', async () => {
      await fileManager.writeJsonFile(testFilePath, testData);
      
      const fileContent = fs.readFileSync(testFilePath, 'utf8');
      const parsedContent = JSON.parse(fileContent);
      
      expect(parsedContent).toEqual(testData);
    });

    it('should create directory if it does not exist', async () => {
      const nestedFilePath = path.join(testDir, 'nested', 'test.json');
      
      await fileManager.writeJsonFile(nestedFilePath, testData);
      
      expect(fs.existsSync(path.dirname(nestedFilePath))).toBe(true);
      expect(fs.existsSync(nestedFilePath)).toBe(true);
    });
  });

  describe('deleteFile', () => {
    it('should delete file if it exists', async () => {
      // Create test file
      fs.writeFileSync(testFilePath, JSON.stringify(testData));
      
      await fileManager.deleteFile(testFilePath);
      
      expect(fs.existsSync(testFilePath)).toBe(false);
    });

    it('should not throw error if file does not exist', async () => {
      const nonExistentFile = path.join(testDir, 'non-existent.json');
      
      await expect(fileManager.deleteFile(nonExistentFile)).resolves.not.toThrow();
    });
  });

  describe('createBackup', () => {
    it('should create backup of file', async () => {
      // Create test file
      fs.writeFileSync(testFilePath, JSON.stringify(testData));
      
      const backupPath = await fileManager.createBackup(testFilePath);
      
      // Check that backupPath is not null before proceeding
      expect(backupPath).not.toBeNull();
      if (backupPath) {
        expect(fs.existsSync(backupPath)).toBe(true);
        
        const backupContent = fs.readFileSync(backupPath, 'utf8');
        const parsedBackup = JSON.parse(backupContent);
        
        expect(parsedBackup).toEqual(testData);
      }
    });
  });

  describe('restoreFromBackup', () => {
    it('should restore file from backup', async () => {
      // Create test file
      fs.writeFileSync(testFilePath, JSON.stringify(testData));
      
      // Create backup
      const backupPath = await fileManager.createBackup(testFilePath);
      
      // Check that backupPath is not null before proceeding
      expect(backupPath).not.toBeNull();
      if (backupPath) {
        // Modify original file
        const modifiedData = { test: 'modified' };
        fs.writeFileSync(testFilePath, JSON.stringify(modifiedData));
        
        // Restore backup
        await fileManager.restoreFromBackup(backupPath, testFilePath);
        
        const restoredContent = fs.readFileSync(testFilePath, 'utf8');
        const parsedRestored = JSON.parse(restoredContent);
        
        expect(parsedRestored).toEqual(testData);
      }
    });
  });
});
