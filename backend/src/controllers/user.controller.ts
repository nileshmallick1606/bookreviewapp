// src/controllers/user.controller.ts
import { Request, Response } from 'express';
import { getUserById, updateUser } from '../services/userService';
import { getUserProfile } from '../services/profileService';

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
        genrePreferences: user.genrePreferences || [],
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

/**
 * Get user profile with statistics
 * Returns user data with review count and favorites count
 */
export const getProfileController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const { user, stats } = await getUserProfile(id);
    
    if (!user) {
      res.status(404).json({
        status: 'error',
        error: { code: 404, message: 'User not found' },
        data: null
      });
      return;
    }
    
    // Check if the user is requesting their own profile or someone else's
    const isOwnProfile = req.user?.id === id;
    
    // Return appropriate profile data
    res.status(200).json({
      status: 'success',
      data: {
        id: user.id,
        name: user.name,
        email: isOwnProfile ? user.email : undefined, // Only include email if it's the user's own profile
        profilePicture: user.profilePicture,
        genrePreferences: user.genrePreferences || [],
        stats,
        createdAt: user.createdAt,
      },
      error: null
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({
      status: 'error',
      error: { code: 500, message: 'Failed to get user profile' },
      data: null
    });
  }
};

/**
 * Update user profile
 * This endpoint requires authentication and can only update the user's own profile
 */
export const updateProfileController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const requestUserId = req.user?.id;
    
    // Check if the user is updating their own profile
    if (id !== requestUserId) {
      res.status(403).json({
        status: 'error',
        error: { code: 403, message: 'You can only update your own profile' },
        data: null
      });
      return;
    }
    
    // Get existing user
    const existingUser = await getUserById(id);
    
    if (!existingUser) {
      res.status(404).json({
        status: 'error',
        error: { code: 404, message: 'User not found' },
        data: null
      });
      return;
    }
    
    // Get fields to update from request body
    const { name, genrePreferences, profilePicture } = req.body;
    
    // Update the user object
    const updatedUser = {
      ...existingUser,
      name: name || existingUser.name,
      genrePreferences: genrePreferences || existingUser.genrePreferences,
      profilePicture: profilePicture || existingUser.profilePicture
    };
    
    // Save the updated user
    const savedUser = await updateUser(updatedUser);
    
    // Return the updated user profile
    res.status(200).json({
      status: 'success',
      data: {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        profilePicture: savedUser.profilePicture,
        genrePreferences: savedUser.genrePreferences || [],
        createdAt: savedUser.createdAt,
        updatedAt: savedUser.updatedAt
      },
      error: null
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      status: 'error',
      error: { code: 500, message: 'Failed to update user profile' },
      data: null
    });
  }
};
