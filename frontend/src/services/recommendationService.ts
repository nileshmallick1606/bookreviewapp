import api from './api';
import { Book } from './bookService';

// Interface for recommendation response
export interface RecommendationResponse {
  recommendations: Book[];
  isPersonalized: boolean;
  source: 'basic' | 'ai' | 'fallback';
  refreshed?: boolean;
  aiAvailable?: boolean;
}

/**
 * Service for recommendation-related API calls
 */
export const RecommendationService = {
  /**
   * Get recommendations based on user preferences and top-rated books
   * @param limit Maximum number of recommendations to return
   * @param minRating Minimum rating threshold (optional)
   * @param genres Array of genres to filter by (optional)
   * @returns Promise with recommendation response
   */
  async getRecommendations(
    limit: number = 10,
    minRating?: number,
    genres?: string[]
  ): Promise<RecommendationResponse> {
    try {
      const queryParams: Record<string, any> = { limit };
      
      if (minRating !== undefined) {
        queryParams.minRating = minRating;
      }
      
      if (genres && genres.length > 0) {
        queryParams.genres = genres.join(',');
      }
      
      const response = await api.get('/recommendations', {
        params: queryParams
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }
  },
  
  /**
   * Refresh recommendations (force new recommendations)
   * @param limit Maximum number of recommendations to return
   * @returns Promise with recommendation response
   */
  async refreshRecommendations(limit: number = 10): Promise<RecommendationResponse> {
    try {
      // Try the dedicated refresh endpoint first (requires authentication)
      try {
        const response = await api.get('/recommendations/refresh', {
          params: { limit }
        });
        return response.data.data;
      } catch (authError) {
        // Fall back to the standard endpoint with refresh parameter
        const response = await api.get('/recommendations', {
          params: { 
            limit,
            refresh: true,
            timestamp: new Date().getTime() // Cache busting
          }
        });
        return response.data.data;
      }
    } catch (error) {
      console.error('Error refreshing recommendations:', error);
      throw error;
    }
  },
  
  /**
   * Get recommendations filtered by genre
   * @param genres Array of genres to filter by
   * @param limit Maximum number of recommendations to return
   * @returns Promise with recommendation response
   */
  async getRecommendationsByGenre(
    genres: string[],
    limit: number = 10
  ): Promise<RecommendationResponse> {
    try {
      const response = await api.get('/recommendations', {
        params: {
          limit,
          genres: genres.join(',')
        }
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching recommendations by genre:', error);
      throw error;
    }
  }
};
