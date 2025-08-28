// src/services/userService.ts
import api from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  genrePreferences?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProfileStats {
  reviewCount: number;
  favoriteCount: number;
}

export interface UserProfile extends User {
  stats: ProfileStats;
}

export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const response = await api.get(`/users/${userId}/profile`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export interface ProfileUpdateData {
  name?: string;
  profilePicture?: string;
  genrePreferences?: string[];
}

export const updateProfile = async (userId: string, data: ProfileUpdateData): Promise<User | null> => {
  try {
    const response = await api.put(`/users/${userId}/profile`, data);
    return response.data.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    return null;
  }
};
