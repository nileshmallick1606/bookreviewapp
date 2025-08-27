// src/services/userService.ts
import api from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
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
