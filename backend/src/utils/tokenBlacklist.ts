// src/utils/tokenBlacklist.ts
import fs from 'fs/promises';
import path from 'path';

// Constants for file paths
const BLACKLIST_DIR = path.resolve(__dirname, '../../data/tokens');
const BLACKLIST_FILE = path.resolve(BLACKLIST_DIR, 'blacklist.json');

// Type definition for blacklisted tokens
interface BlacklistedToken {
  token: string;
  expiresAt: string; // ISO string timestamp
}

// Ensure the blacklist directory exists
const ensureBlacklistDirectory = async (): Promise<void> => {
  try {
    await fs.mkdir(BLACKLIST_DIR, { recursive: true });
    
    // Create blacklist file if it doesn't exist
    try {
      await fs.access(BLACKLIST_FILE);
    } catch (error) {
      await fs.writeFile(BLACKLIST_FILE, JSON.stringify([], null, 2));
    }
  } catch (error) {
    console.error('Error ensuring blacklist directory:', error);
    throw new Error('Failed to initialize token blacklist storage');
  }
};

/**
 * Get the current token blacklist
 * @returns Array of blacklisted tokens
 */
export const getBlacklist = async (): Promise<BlacklistedToken[]> => {
  await ensureBlacklistDirectory();
  
  try {
    const data = await fs.readFile(BLACKLIST_FILE, 'utf-8');
    return JSON.parse(data) as BlacklistedToken[];
  } catch (error) {
    console.error('Error getting token blacklist:', error);
    return [];
  }
};

/**
 * Add a token to the blacklist
 * @param token JWT token to blacklist
 * @param expiresAt Token expiration date
 */
export const blacklistToken = async (token: string, expiresAt: Date): Promise<void> => {
  try {
    const blacklist = await getBlacklist();
    
    // Add token to blacklist
    blacklist.push({
      token,
      expiresAt: expiresAt.toISOString()
    });
    
    // Save updated blacklist
    await fs.writeFile(BLACKLIST_FILE, JSON.stringify(blacklist, null, 2));
    
    // Clean up expired tokens from blacklist
    await cleanupExpiredTokens();
  } catch (error) {
    console.error('Error blacklisting token:', error);
    throw new Error('Failed to blacklist token');
  }
};

/**
 * Check if a token is blacklisted
 * @param token JWT token to check
 * @returns true if token is blacklisted, false otherwise
 */
export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  try {
    const blacklist = await getBlacklist();
    return blacklist.some(item => item.token === token);
  } catch (error) {
    console.error('Error checking token blacklist:', error);
    // For security, return true on error
    return true;
  }
};

/**
 * Remove expired tokens from the blacklist
 */
export const cleanupExpiredTokens = async (): Promise<void> => {
  try {
    const blacklist = await getBlacklist();
    const now = new Date();
    
    // Filter out expired tokens
    const validTokens = blacklist.filter(item => {
      const expiresAt = new Date(item.expiresAt);
      return expiresAt > now;
    });
    
    // Save updated blacklist
    await fs.writeFile(BLACKLIST_FILE, JSON.stringify(validTokens, null, 2));
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
  }
};
