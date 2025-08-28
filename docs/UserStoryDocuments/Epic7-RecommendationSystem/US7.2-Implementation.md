# User Story 7.2: AI-Powered Recommendations - Implementation Notes

## Overview

This document describes the implementation details for User Story 7.2: AI-Powered Recommendations using OpenAI's GPT models.

## Implementation Details

### Backend Components

1. **OpenAI Service (`openai.service.ts`)**
   - Creates a service to interact with OpenAI's API
   - Uses GPT-4o-mini model for recommendations
   - Handles API requests, errors, and response parsing
   - Transforms user data into appropriate prompts

2. **Recommendation Service Enhancement (`recommendation.service.ts`)**
   - Added OpenAI integration for personalized recommendations
   - Implements fallback to basic recommendations when AI is unavailable
   - Added helper functions to gather user data for AI context
   - Added AI recommendations caching for performance

3. **Controller Updates (`recommendationController.ts`)**
   - Enhanced to indicate the source of recommendations (AI or basic)
   - Added API response field to indicate AI availability

### Frontend Components

1. **RecommendationService Updates**
   - Added support for AI-powered recommendation responses
   - Enhanced interface to include AI availability information

2. **Recommendations Component**
   - Updated to display different titles based on recommendation source
   - Improved UI to indicate when recommendations are AI-powered

3. **BookRecommendationCarousel Updates**
   - Added AI badge to clearly indicate AI-powered recommendations
   - Enhanced visual styling for AI recommendations

## Configuration

1. **Environment Variables**
   - Added `OPENAI_API_KEY` to the `.env.example` file
   - OpenAI service checks for this key to determine availability

2. **Testing Script**
   - Created `testOpenAIRecommendations.ts` to verify OpenAI integration
   - Added `test:openai` npm script for easy testing

## How It Works

1. When a user requests recommendations:
   - If the user is authenticated and has an OpenAI API key configured:
     - The system collects user data (preferences, reviews, favorites)
     - This data is sent to OpenAI API with a specially crafted prompt
     - OpenAI returns book IDs which are converted to full book objects
     - Results are cached for 24 hours to improve performance
   
   - If AI recommendations fail or are not available:
     - The system automatically falls back to basic recommendations
     - No user action is required for the fallback

2. The frontend indicates whether recommendations are AI-powered:
   - Different title and subtitle
   - AI badge next to the title
   - Consistent user experience regardless of recommendation source

## Usage

To use AI-powered recommendations:

1. Set the `OPENAI_API_KEY` in the `.env` file
2. Restart the server
3. Log in as a user with reviews or preferences
4. Visit the recommendations section

To test the OpenAI integration:

```bash
npm run test:openai
```

## Technical Considerations

- Response parsing is robust against different OpenAI response formats
- Error handling ensures users always get recommendations even if AI fails
- Caching reduces API costs and improves performance
- Personalization improves with more user interaction data
