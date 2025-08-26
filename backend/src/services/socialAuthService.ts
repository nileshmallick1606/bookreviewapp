// src/services/socialAuthService.ts
import { User, SocialProvider, UserInput } from '../models/user';
import { findUserByEmail, createNewUser, getUserById, updateUser } from '../services/userService';
import { generateToken } from '../utils/jwt';

/**
 * Handle social authentication for a user
 * @param profile User profile data from social provider
 * @returns The user object and JWT token
 */
export const handleSocialAuth = async (
  provider: 'google' | 'facebook',
  providerId: string,
  email: string,
  name: string,
  profileData?: Record<string, any>
): Promise<{ user: User; token: string }> => {
  try {
    // Check if user exists with this email
    let user = await findUserByEmail(email);
    
    // Prepare social provider data
    const socialProvider: SocialProvider = {
      provider,
      providerId,
      profileData
    };
    
    if (user) {
      // User exists - update with social provider data if not already linked
      if (!user.socialProviders) {
        user.socialProviders = [];
      }
      
      // Check if this social provider is already linked
      const existingProviderIndex = user.socialProviders.findIndex(
        p => p.provider === provider && p.providerId === providerId
      );
      
      if (existingProviderIndex === -1) {
        // Add new social provider
        user.socialProviders.push(socialProvider);
        user = await updateUser(user);
      }
    } else {
      // Create new user with social provider data
      const userData: UserInput = {
        email,
        name,
        socialProvider
      };
      
      user = await createNewUser(userData);
    }
    
    // At this point, user cannot be null since we either found it or created it
    if (!user) {
      throw new Error('Failed to find or create user during social authentication');
    }
    
    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name
    });
    
    return { user, token };
  } catch (error) {
    console.error('Error in social authentication:', error);
    throw new Error('Failed to process social authentication');
  }
};

/**
 * Find a user by social provider and provider ID
 * @param provider The social provider (google, facebook, etc)
 * @param providerId The ID from the provider
 * @returns The user if found, null otherwise
 */
export const findUserBySocialProvider = async (
  provider: string,
  providerId: string
): Promise<User | null> => {
  // This is a simplistic implementation that would need to be optimized
  // for production with proper indexing
  
  try {
    // In a real implementation, you would use a database query with indexing
    // For this file-based implementation, we'll do a sequential scan
    // Note: This would be inefficient for large user bases
    
    // Get all users and check each one
    // In a real database, you would use a query like:
    // SELECT * FROM users WHERE socialProviders.provider = ? AND socialProviders.providerId = ?
    
    // For now, let's implement a basic version that works with our file system
    // This would need to be replaced with a proper indexed query in production
    
    // TODO: Implement indexed lookup for social providers
    
    return null; // Placeholder - implement actual lookup logic
  } catch (error) {
    console.error('Error finding user by social provider:', error);
    throw new Error('Failed to find user by social provider');
  }
};
