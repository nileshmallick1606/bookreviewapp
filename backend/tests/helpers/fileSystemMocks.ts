/**
 * File system mocking utilities for testing
 * Provides helpers to mock the file-based data storage system
 */

import fs from 'fs';
import path from 'path';
import { PathOrFileDescriptor } from 'fs';
import {jest} from '@jest/globals';

// Store original fs methods
const originalFsMethods = {
  readFile: fs.readFile,
  writeFile: fs.writeFile,
  readdir: fs.readdir,
  mkdir: fs.mkdir,
  access: fs.access,
  unlink: fs.unlink,
  existsSync: fs.existsSync,
};

// Create in-memory file system for testing
const mockFileSystem: Record<string, string> = {};

/**
 * Setup mocks for file system operations
 */
export const setupFileMocks = () => {
  // Mock fs.readFile
  jest.spyOn(fs, 'readFile').mockImplementation(
    (path: PathOrFileDescriptor, optionsOrCallback: any, maybeCallback?: any) => {
      const callback = typeof optionsOrCallback === 'function'
        ? optionsOrCallback
        : maybeCallback;
      
      const filePath = path.toString();
      
      if (mockFileSystem[filePath]) {
        process.nextTick(() => callback(null, mockFileSystem[filePath]));
      } else {
        process.nextTick(() => callback(new Error(`ENOENT: no such file or directory, open '${filePath}'`)));
      }
    }
  );
  
  // Mock fs.writeFile
  jest.spyOn(fs, 'writeFile').mockImplementation(
    (path: PathOrFileDescriptor, data: any, optionsOrCallback: any, maybeCallback?: any) => {
      const callback = typeof optionsOrCallback === 'function'
        ? optionsOrCallback
        : maybeCallback;
      
      const filePath = path.toString();
      mockFileSystem[filePath] = data.toString();
      
      if (callback) process.nextTick(() => callback(null));
    }
  );
  
  // Mock fs.readdir
  jest.spyOn(fs, 'readdir').mockImplementation(
    (path: PathOrFileDescriptor, optionsOrCallback: any, maybeCallback?: any) => {
      const callback = typeof optionsOrCallback === 'function'
        ? optionsOrCallback
        : maybeCallback;
      
      const dirPath = path.toString();
      const fileNames = Object.keys(mockFileSystem)
        .filter(filePath => filePath.startsWith(dirPath))
        .map(filePath => filePath.replace(dirPath + '/', ''))
        .filter(name => !name.includes('/'));
      
      process.nextTick(() => callback(null, fileNames));
    }
  );
  
  // Mock fs.existsSync
  jest.spyOn(fs, 'existsSync').mockImplementation((path: PathOrFileDescriptor) => {
    const filePath = path.toString();
    return filePath in mockFileSystem;
  });
  
  // More mocks can be added as needed
};

/**
 * Reset the mock file system to empty state
 */
export const resetMockFileSystem = () => {
  Object.keys(mockFileSystem).forEach(key => delete mockFileSystem[key]);
};

/**
 * Add a mock file to the in-memory file system
 */
export const addMockFile = (filePath: string, content: string) => {
  mockFileSystem[filePath] = content;
};

/**
 * Restore original fs methods
 */
export const restoreFileMocks = () => {
  jest.restoreAllMocks();
};

/**
 * Create all necessary mock files for a specific entity type
 * @param entityType - The type of entity (users, books, reviews)
 * @param entities - Array of entity objects
 */
export const setupEntityMockFiles = (entityType: string, entities: any[]) => {
  entities.forEach(entity => {
    const filePath = `/data/${entityType}/${entity.id}.json`;
    addMockFile(filePath, JSON.stringify(entity, null, 2));
  });
};
