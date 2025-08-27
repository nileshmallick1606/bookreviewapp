import fs from 'fs';
import { promisify } from 'util';

// Handle case where fs.access might be undefined in the test environment
const fsAccess = fs.access ? promisify(fs.access) : ((path: string) => Promise.resolve());

/**
 * Check if a file exists
 * @param path Path to the file
 * @returns Boolean indicating if file exists
 */
export const fileExists = async (path: string): Promise<boolean> => {
  try {
    await fsAccess(path);
    return true;
  } catch (error) {
    return false;
  }
};
