// src/models/user.ts
import { v4 as uuidv4 } from 'uuid';

/**
 * User interface defining the structure of user data
 */
export interface User {
  id: string;
  email: string;
  password: string; // This will store the hashed password
  name: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * User input data for registration
 */
export interface UserInput {
  email: string;
  password: string;
  name: string;
}

/**
 * Create a new user object with default values
 * @param data User input data
 * @returns A complete User object
 */
export const createUser = (data: UserInput): User => {
  const now = new Date().toISOString();
  
  return {
    id: uuidv4(),
    email: data.email.toLowerCase(),
    password: data.password, // Note: This should be hashed before storing
    name: data.name,
    createdAt: now,
    updatedAt: now
  };
};

/**
 * User data for responses (excludes password)
 */
export interface UserResponse {
  id: string;
  email: string;
  name: string;
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
