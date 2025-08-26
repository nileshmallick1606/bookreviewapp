// src/services/authService.ts
import axios from 'axios';

// Base URL for API calls
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Types
export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UserData {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  status: string;
  data: {
    user: UserData;
    message?: string;
  };
  error: null;
}

export interface ErrorResponse {
  status: string;
  data: null;
  error: {
    code: number;
    message: string;
    errors?: any[];
  };
}

/**
 * Register a new user
 * @param data User registration data
 * @returns Promise with user data or error
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await axios.post<AuthResponse>(
      `${API_BASE_URL}/auth/register`,
      data,
      { withCredentials: true } // Important for cookie handling
    );
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data as ErrorResponse;
    }
    
    throw {
      status: 'error',
      data: null,
      error: {
        code: 500,
        message: 'An unexpected error occurred during registration'
      }
    } as ErrorResponse;
  }
};

/**
 * Login with email and password
 * @param data Login credentials
 * @returns Promise with user data or error
 */
export const login = async (data: LoginData & { rememberMe?: boolean }): Promise<AuthResponse> => {
  try {
    const response = await axios.post<AuthResponse>(
      `${API_BASE_URL}/auth/login`,
      data,
      { withCredentials: true } // Important for cookie handling
    );
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data as ErrorResponse;
    }
    
    throw {
      status: 'error',
      data: null,
      error: {
        code: 500,
        message: 'An unexpected error occurred during login'
      }
    } as ErrorResponse;
  }
};

/**
 * Get the current authenticated user
 * @returns Promise with user data or error
 */
export const getCurrentUser = async (): Promise<AuthResponse> => {
  try {
    const response = await axios.get<AuthResponse>(
      `${API_BASE_URL}/auth/me`,
      { withCredentials: true }
    );
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data as ErrorResponse;
    }
    
    throw {
      status: 'error',
      data: null,
      error: {
        code: 401,
        message: 'Not authenticated'
      }
    } as ErrorResponse;
  }
};
