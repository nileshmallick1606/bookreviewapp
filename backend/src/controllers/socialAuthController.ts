// src/controllers/socialAuthController.ts
import { Request, Response, NextFunction } from 'express';
import { handleSocialAuth } from '../services/socialAuthService';
import { setTokenCookie } from '../utils/jwt';
import { toUserResponse } from '../models/user';

/**
 * Google OAuth callback handler
 * Processes OAuth response from Google
 */
export const googleAuthCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Google OAuth would typically provide this data in the request
    // In a real implementation, this would come from the OAuth provider's callback
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({
        status: 'error',
        data: null,
        error: {
          code: 400,
          message: 'Authorization code is required'
        }
      });
    }
    
    // In a real implementation, you would exchange the code for tokens
    // and get user profile data from Google
    // This is a simplified placeholder for that process
    
    // Mock Google profile data - in a real app, this would come from Google's API
    // after exchanging the authorization code for tokens
    const googleProfile = {
      id: 'google-user-id', // Would be the actual Google user ID
      email: 'user@example.com', // Would be the user's actual Google email
      name: 'Google User', // Would be the user's actual name from Google
      picture: 'https://example.com/profile.jpg' // Would be the user's profile picture URL
    };
    
    // Process the social authentication
    const { user, token } = await handleSocialAuth(
      'google',
      googleProfile.id,
      googleProfile.email,
      googleProfile.name,
      {
        picture: googleProfile.picture
      }
    );
    
    // Set token in HTTP-only cookie
    setTokenCookie(res, token);
    
    // Return success response with user data
    return res.status(200).json({
      status: 'success',
      data: {
        user: toUserResponse(user),
        message: 'Google authentication successful'
      },
      error: null
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * Facebook OAuth callback handler
 * Processes OAuth response from Facebook
 */
export const facebookAuthCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Facebook OAuth would typically provide this data in the request
    // In a real implementation, this would come from the OAuth provider's callback
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({
        status: 'error',
        data: null,
        error: {
          code: 400,
          message: 'Authorization code is required'
        }
      });
    }
    
    // In a real implementation, you would exchange the code for tokens
    // and get user profile data from Facebook
    // This is a simplified placeholder for that process
    
    // Mock Facebook profile data - in a real app, this would come from Facebook's API
    // after exchanging the authorization code for tokens
    const facebookProfile = {
      id: 'facebook-user-id', // Would be the actual Facebook user ID
      email: 'user@example.com', // Would be the user's actual Facebook email
      name: 'Facebook User', // Would be the user's actual name from Facebook
      picture: 'https://example.com/profile.jpg' // Would be the user's profile picture URL
    };
    
    // Process the social authentication
    const { user, token } = await handleSocialAuth(
      'facebook',
      facebookProfile.id,
      facebookProfile.email,
      facebookProfile.name,
      {
        picture: facebookProfile.picture
      }
    );
    
    // Set token in HTTP-only cookie
    setTokenCookie(res, token);
    
    // Return success response with user data
    return res.status(200).json({
      status: 'success',
      data: {
        user: toUserResponse(user),
        message: 'Facebook authentication successful'
      },
      error: null
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * Initiate OAuth flow with Google
 */
export const initiateGoogleAuth = (req: Request, res: Response) => {
  // In a real implementation, you would redirect to Google's OAuth URL
  // with your client ID, redirect URI, and requested scopes
  
  // This is a placeholder for that redirection
  const googleOAuthUrl = 
    'https://accounts.google.com/o/oauth2/v2/auth' +
    '?client_id=YOUR_GOOGLE_CLIENT_ID' +
    '&redirect_uri=http://localhost:3000/api/v1/auth/google/callback' +
    '&response_type=code' +
    '&scope=email%20profile';
  
  return res.status(200).json({
    status: 'success',
    data: {
      authUrl: googleOAuthUrl,
      message: 'Redirect the user to this URL to begin Google authentication'
    },
    error: null
  });
};

/**
 * Initiate OAuth flow with Facebook
 */
export const initiateFacebookAuth = (req: Request, res: Response) => {
  // In a real implementation, you would redirect to Facebook's OAuth URL
  // with your client ID, redirect URI, and requested scopes
  
  // This is a placeholder for that redirection
  const facebookOAuthUrl = 
    'https://www.facebook.com/v12.0/dialog/oauth' +
    '?client_id=YOUR_FACEBOOK_APP_ID' +
    '&redirect_uri=http://localhost:3000/api/v1/auth/facebook/callback' +
    '&response_type=code' +
    '&scope=email,public_profile';
  
  return res.status(200).json({
    status: 'success',
    data: {
      authUrl: facebookOAuthUrl,
      message: 'Redirect the user to this URL to begin Facebook authentication'
    },
    error: null
  });
};
