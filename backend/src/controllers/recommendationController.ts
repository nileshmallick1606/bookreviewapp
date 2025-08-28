import { Request, Response } from 'express';
import { getBasicRecommendations, getUserRecommendations, clearRecommendationsCache } from '../services/recommendation/recommendation.service';
import { OpenAIService } from '../services/ai/openai.service';

/**
 * Controller for recommendation-related endpoints
 */
export class RecommendationController {
  /**
   * Get recommendations for the current user or general recommendations if not logged in
   * @param req Express request object
   * @param res Express response object
   */
  static async getRecommendations(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const minRating = parseFloat(req.query.minRating as string) || 4.0;
      const genres = req.query.genres 
        ? (req.query.genres as string).split(',')
        : undefined;
      const refresh = req.query.refresh === 'true';
      
      // Check if AI recommendations are available
      const openaiService = new OpenAIService();
      const aiAvailable = openaiService.isAvailable();
      
      // If user is logged in, get personalized recommendations
      const userId = req.user?.id || null;
      const recommendations = await getUserRecommendations(userId, limit, refresh);
      
      // Determine source of recommendations
      let source = 'basic';
      if (userId && aiAvailable) {
        source = 'ai';
      }
      
      return res.status(200).json({
        status: 'success',
        data: { 
          recommendations,
          isPersonalized: !!userId,
          source: source,
          aiAvailable: aiAvailable
        },
        error: null
      });
    } catch (error) {
      console.error('Error in getRecommendations controller:', error);
      
      // Try to fall back to basic recommendations in case of error
      try {
        const limit = parseInt(req.query.limit as string) || 10;
        const recommendations = await getBasicRecommendations(limit);
        
        return res.status(200).json({
          status: 'success',
          data: { 
            recommendations,
            isPersonalized: false,
            source: 'fallback'
          },
          error: null
        });
      } catch (fallbackError) {
        return res.status(500).json({
          status: 'error',
          data: null,
          error: { code: 500, message: 'Failed to fetch recommendations' }
        });
      }
    }
  }
  
  /**
   * Refresh the recommendations cache for a user
   * @param req Express request object
   * @param res Express response object
   */
  static async refreshRecommendations(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      
      // Clear cache for the user (or all users if admin)
      if (userId) {
        clearRecommendationsCache(userId);
      }
      
      // Get fresh recommendations
      const limit = parseInt(req.query.limit as string) || 10;
      const recommendations = await getUserRecommendations(userId || null, limit, true);
      
      return res.status(200).json({
        status: 'success',
        data: { 
          recommendations,
          isPersonalized: !!userId,
          refreshed: true
        },
        error: null
      });
    } catch (error) {
      console.error('Error refreshing recommendations:', error);
      return res.status(500).json({
        status: 'error',
        data: null,
        error: { code: 500, message: 'Failed to refresh recommendations' }
      });
    }
  }
}
