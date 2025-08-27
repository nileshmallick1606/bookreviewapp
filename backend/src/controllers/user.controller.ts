// src/controllers/user.controller.ts
import { Request, Response } from 'express';
import { getUserById } from '../services/userService';

/**
 * Get user by ID
 * Returns public user data
 */
export const getUserByIdController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const user = await getUserById(id);
    
    if (!user) {
      res.status(404).json({
        status: 'error',
        error: { code: 404, message: 'User not found' },
        data: null
      });
      return;
    }
    
    // Return only public user data
    res.status(200).json({
      status: 'success',
      data: {
        id: user.id,
        name: user.name,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
      },
      error: null
    });
  } catch (error) {
    console.error('Error getting user by ID:', error);
    res.status(500).json({
      status: 'error',
      error: { code: 500, message: 'Failed to get user data' },
      data: null
    });
  }
};
