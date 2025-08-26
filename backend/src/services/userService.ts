// src/services/userService.ts
import fs from 'fs/promises';
import path from 'path';
import { User, UserInput, createUser } from '../models/user';
import { hashPassword } from '../utils/password';

// Constants for file paths
const USER_DATA_DIR = path.resolve(__dirname, '../../data/users');
const USER_INDEX_DIR = path.resolve(__dirname, '../../data/indexes');
const EMAIL_INDEX_FILE = path.resolve(USER_INDEX_DIR, 'email-index.json');

// Ensure directories exist
const initStorage = async (): Promise<void> => {
  try {
    await fs.mkdir(USER_DATA_DIR, { recursive: true });
    await fs.mkdir(USER_INDEX_DIR, { recursive: true });
    
    // Create email index file if it doesn't exist
    try {
      await fs.access(EMAIL_INDEX_FILE);
    } catch (error) {
      await fs.writeFile(EMAIL_INDEX_FILE, JSON.stringify({}, null, 2));
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
    throw new Error('Failed to initialize user storage');
  }
};

/**
 * Get email index mapping
 * @returns Map of email to user ID
 */
const getEmailIndex = async (): Promise<Record<string, string>> => {
  try {
    const data = await fs.readFile(EMAIL_INDEX_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If the file doesn't exist or is invalid, return an empty index
    return {};
  }
};

/**
 * Update email index with a new mapping
 * @param email Email address
 * @param userId User ID
 */
const updateEmailIndex = async (email: string, userId: string): Promise<void> => {
  try {
    const emailIndex = await getEmailIndex();
    emailIndex[email.toLowerCase()] = userId;
    await fs.writeFile(EMAIL_INDEX_FILE, JSON.stringify(emailIndex, null, 2));
  } catch (error) {
    console.error('Error updating email index:', error);
    throw new Error('Failed to update email index');
  }
};

/**
 * Find a user by their email address
 * @param email Email address to search for
 * @returns User object if found, null otherwise
 */
export const findUserByEmail = async (email: string): Promise<User | null> => {
  try {
    await initStorage();
    const emailIndex = await getEmailIndex();
    const userId = emailIndex[email.toLowerCase()];
    
    if (!userId) {
      return null;
    }
    
    return getUserById(userId);
  } catch (error) {
    console.error('Error finding user by email:', error);
    throw new Error('Failed to find user by email');
  }
};

/**
 * Get a user by their ID
 * @param id User ID to retrieve
 * @returns User object if found, null otherwise
 */
export const getUserById = async (id: string): Promise<User | null> => {
  try {
    await initStorage();
    const userFilePath = path.resolve(USER_DATA_DIR, `${id}.json`);
    
    try {
      const data = await fs.readFile(userFilePath, 'utf-8');
      return JSON.parse(data) as User;
    } catch (error) {
      // File doesn't exist or isn't readable
      return null;
    }
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw new Error('Failed to get user by ID');
  }
};

/**
 * Create a new user with the provided data
 * @param userData User input data
 * @returns The created user object
 * @throws Error if the email already exists
 */
export const createNewUser = async (userData: UserInput): Promise<User> => {
  try {
    await initStorage();
    
    // Check if email already exists
    const existingUser = await findUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email already in use');
    }
    
    // Create new user object
    const user = createUser(userData);
    
    // Hash the password if provided
    if (userData.password) {
      user.password = await hashPassword(userData.password);
    }
    
    // Save user to file
    const userFilePath = path.resolve(USER_DATA_DIR, `${user.id}.json`);
    await fs.writeFile(userFilePath, JSON.stringify(user, null, 2));
    
    // Update email index
    await updateEmailIndex(user.email, user.id);
    
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    if ((error as Error).message === 'Email already in use') {
      throw error;
    }
    throw new Error('Failed to create user');
  }
};

/**
 * Update an existing user's data
 * @param user The user object with updated values
 * @returns The updated user object
 */
export const updateUser = async (user: User): Promise<User> => {
  try {
    await initStorage();
    
    // Make sure the user exists
    const existingUser = await getUserById(user.id);
    if (!existingUser) {
      throw new Error('User not found');
    }
    
    // Update the user's updatedAt timestamp
    user.updatedAt = new Date().toISOString();
    
    // Save updated user to file
    const userFilePath = path.resolve(USER_DATA_DIR, `${user.id}.json`);
    await fs.writeFile(userFilePath, JSON.stringify(user, null, 2));
    
    // If email changed, update the index
    if (existingUser.email !== user.email) {
      await updateEmailIndex(user.email, user.id);
      // TODO: Remove old email from index if implemented
    }
    
    return user;
  } catch (error) {
    console.error('Error updating user:', error);
    throw new Error('Failed to update user');
  }
};
