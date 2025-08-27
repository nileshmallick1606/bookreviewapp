import fs from 'fs';
import { promisify } from 'util';

const fsAccess = promisify(fs.access);

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
