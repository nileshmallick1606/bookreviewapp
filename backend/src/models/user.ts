// src/models/user.ts
import { v4 as uuidv4 } from 'uuid';

/**
 * Social provider information
 */
export interface SocialProvider {
  provider: 'google' | 'facebook';
  providerId: string;
  profileData?: Record<string, any>;
}

/**
 * User interface defining the structure of user data
 */
export interface User {
  id: string;
  email: string;
  password?: string; // This will store the hashed password, optional for social login
  name: string;
  profilePicture?: string; // URL to user's profile picture
  genrePreferences?: string[]; // User's preferred book genres
  socialProviders?: SocialProvider[];
  createdAt: string;
  updatedAt: string;
}

/**
 * User input data for registration
 */
export interface UserInput {
  email: string;
  password?: string; // Optional for social login
  name: string;
  genrePreferences?: string[]; // Added genre preferences
  socialProvider?: SocialProvider;
}

/**
 * Create a new user object with default values
 * @param data User input data
 * @returns A complete User object
 */
export const createUser = (data: UserInput): User => {
  const now = new Date().toISOString();
  
  const user: User = {
    id: uuidv4(),
    email: data.email.toLowerCase(),
    name: data.name,
    createdAt: now,
    updatedAt: now
  };

  // Add password if provided
  if (data.password) {
    user.password = data.password;
  }

  // Add social provider if provided
  if (data.socialProvider) {
    user.socialProviders = [data.socialProvider];
  }
  
  // Add genre preferences if provided
  if (data.genrePreferences) {
    user.genrePreferences = data.genrePreferences;
  }
  
  return user;
};

/**
 * User data for responses (excludes password)
 */
export interface UserResponse {
  id: string;
  email: string;
  name: string;
  profilePicture?: string;
  genrePreferences?: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Convert a User object to a safe response object (without password)
 * @param user User object
 * @returns User response object without sensitive data
 */
export const toUserResponse = (user: User): UserResponse => {
  const { password, ...userResponse } = user;
  return userResponse;
};
