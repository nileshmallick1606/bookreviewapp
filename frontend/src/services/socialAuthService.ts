// src/services/socialAuthService.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

/**
 * Initiate social authentication with a provider
 * @param provider The social provider (google, facebook)
 * @returns The URL to redirect to for authentication
 */
export const initiateSocialAuth = async (provider: string): Promise<string> => {
  try {
    const response = await axios.get(`${API_URL}/auth/${provider}`);
    return response.data.data.authUrl;
  } catch (error) {
    console.error(`Error initiating ${provider} authentication:`, error);
    throw error;
  }
};

/**
 * Handle the social authentication callback
 * This would typically be called on the callback page after the OAuth provider redirects back
 * @param provider The social provider (google, facebook)
 * @param code The authorization code from the OAuth provider
 * @returns The authenticated user data
 */
export const handleSocialAuthCallback = async (provider: string, code: string) => {
  try {
    const response = await axios.get(`${API_URL}/auth/${provider}/callback`, {
      params: { code },
      withCredentials: true // Needed to receive and store the HTTP-only cookie
    });
    
    return response.data.data;
  } catch (error) {
    console.error(`Error completing ${provider} authentication:`, error);
    throw error;
  }
};
