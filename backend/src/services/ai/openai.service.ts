// Use require for axios to bypass TypeScript's module checking
import axios from 'axios';
import { Book } from '../../models/interfaces/book.interface';
import { User } from '../../models/interfaces/user.interface';
import { Review } from '../../models/interfaces/review.interface';
import { NotFoundError, APIError } from '../../utils/errors';

// Interface for OpenAI API response
interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Service for OpenAI integration
 */
export class OpenAIService {
  private apiKey: string;
  private apiUrl: string = 'https://api.openai.com/v1/chat/completions';
  private model: string = 'gpt-4o-mini';
  private maxTokens: number = 2000;
  
  /**
   * Create an instance of OpenAIService
   */
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('OpenAI API key is not configured. AI-powered recommendations will not be available.');
    }
  }
  
  /**
   * Check if OpenAI integration is available
   */
  public isAvailable(): boolean {
    return Boolean(this.apiKey);
  }
  
  /**
   * Generate personalized book recommendations based on user data and preferences
   * @param user User object with preferences
   * @param userReviews User's previous reviews
   * @param userFavorites User's favorite books
   * @param availableBooks Available books in the system
   * @param limit Maximum number of recommendations to return
   * @returns Promise with recommended books
   */
  public async getPersonalizedRecommendations(
    user: User,
    userReviews: Review[],
    userFavorites: Book[],
    availableBooks: Book[],
    limit: number = 10
  ): Promise<Book[]> {
    try {
      if (!this.isAvailable()) {
        throw new Error('OpenAI API is not configured');
      }
      
      // Prepare input data for OpenAI
      const userData = this.prepareUserData(user, userReviews, userFavorites);
      
      // Create prompt for OpenAI
      const prompt = this.createRecommendationPrompt(userData, availableBooks);
      
      // Call OpenAI API
      const response = await this.callOpenAI(prompt);
      
      // Parse and validate response
      const recommendedBooks = this.parseRecommendations(response, availableBooks, limit);
      
      return recommendedBooks;
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      throw new APIError('Failed to generate personalized recommendations');
    }
  }
  
  /**
   * Prepare user data for recommendation
   */
  private prepareUserData(
    user: User,
    userReviews: Review[],
    userFavorites: Book[]
  ) {
    // Extract relevant user information
    const favoriteGenres = user.preferences?.favoriteGenres || [];
    const favoriteAuthors = user.preferences?.favoriteAuthors || [];
    
    // Extract book information from reviews
    const reviewedBooks = userReviews.map(review => ({
      bookId: review.bookId,
      rating: review.rating,
      reviewText: review.text?.substring(0, 100) || '', // Limit text length
      timestamp: review.createdAt
    }));
    
    // Extract book information from favorites
    const favoriteBookInfo = userFavorites.map(book => ({
      id: book.id,
      title: book.title,
      author: book.author,
      genres: book.genres || []
    }));
    
    return {
      favoriteGenres,
      favoriteAuthors,
      reviewedBooks,
      favoriteBooks: favoriteBookInfo
    };
  }
  
  /**
   * Create recommendation prompt for OpenAI
   */
  private createRecommendationPrompt(userData: any, availableBooks: Book[]): string {
    // Create sample of available books (limit to 200 for prompt size)
    const bookSample = availableBooks.slice(0, 200).map(book => ({
      id: book.id,
      title: book.title,
      author: book.author,
      genres: book.genres || [],
      averageRating: book.averageRating || 0
    }));
    
    // Format prompt
    return `
      You are a book recommendation system for a book review platform.
      Based on the user's preferences and past activity, suggest ${10} books from the available catalog that they might enjoy.
      
      User preferences:
      - Favorite genres: ${JSON.stringify(userData.favoriteGenres)}
      - Favorite authors: ${JSON.stringify(userData.favoriteAuthors)}
      
      Books the user has reviewed:
      ${JSON.stringify(userData.reviewedBooks)}
      
      Books the user has marked as favorites:
      ${JSON.stringify(userData.favoriteBooks)}
      
      Available books catalog (partial list):
      ${JSON.stringify(bookSample)}
      
      Return only a JSON array of book IDs that you recommend, in order of recommendation strength.
      Format: ["book-id-1", "book-id-2", ...]
    `;
  }
  
  /**
   * Call OpenAI API with prompt
   */
  private async callOpenAI(prompt: string): Promise<string> {
    try {
      // Prepare request data
      const requestData = {
        model: this.model,
        messages: [
          { role: 'system', content: 'You are a book recommendation assistant.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: this.maxTokens,
        temperature: 0.7
      };
      
      // Call OpenAI API using axios
      const response = await axios.post(
        this.apiUrl,
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 seconds timeout
        }
      );
      
      // Extract and return content
      const openAIResponse = response.data as OpenAIResponse;
      return openAIResponse.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw new APIError('Failed to generate recommendations from OpenAI');
    }
  }
  
  /**
   * Parse OpenAI response and return recommended books
   */
  private parseRecommendations(
    response: string,
    availableBooks: Book[],
    limit: number
  ): Book[] {
    try {
      // Extract book IDs from response
      let bookIds: string[] = [];
      
      // Find JSON array in response (handle potential text before/after JSON)
      const jsonMatch = response.match(/\[.*\]/s);
      if (jsonMatch) {
        bookIds = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid response format from OpenAI');
      }
      
      // Get book objects from IDs and filter out any that don't exist
      const bookMap = new Map(availableBooks.map(book => [book.id, book]));
      
      const recommendedBooks = bookIds
        .map(id => bookMap.get(id))
        .filter((book): book is Book => book !== undefined)
        .slice(0, limit);
      
      return recommendedBooks;
    } catch (error) {
      console.error('Error parsing OpenAI recommendations:', error);
      throw new Error('Failed to parse recommendations');
    }
  }
}
