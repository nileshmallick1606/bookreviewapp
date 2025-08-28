import React, { useState, useEffect } from 'react';
import { Container, Typography } from '@mui/material';
import BookRecommendationCarousel from './BookRecommendationCarousel';
import { Book } from '../../services/bookService';
import { RecommendationService, RecommendationResponse } from '../../services/recommendationService';
import { useAppSelector } from '../../hooks/reduxHooks';

/**
 * Component to display book recommendations
 */
const Recommendations: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [source, setSource] = useState<string>('basic');
  
  const { isAuthenticated } = useAppSelector(state => state.auth);

  const handleRecommendationResponse = (data: RecommendationResponse) => {
    setBooks(data.recommendations);
    setIsPersonalized(data.isPersonalized);
    setSource(data.source);
    
    // Log recommendation source for debugging
    console.log(`Loaded ${data.recommendations.length} recommendations. Source: ${data.source}, Personalized: ${data.isPersonalized}, AI Available: ${data.aiAvailable}`);
  };

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await RecommendationService.getRecommendations(10);
      handleRecommendationResponse(response);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Failed to load recommendations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await RecommendationService.refreshRecommendations(10);
      handleRecommendationResponse(response);
    } catch (err) {
      console.error('Error refreshing recommendations:', err);
      setError('Failed to refresh recommendations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [isAuthenticated]); // Refresh when authentication status changes

  // Determine title and subtitle based on personalization and source
  const getTitle = () => {
    if (isPersonalized) {
      return source === 'ai' ? "AI-Powered Recommendations" : "Recommended for You";
    } else {
      return "Top Picks";
    }
  };

  const getSubtitle = () => {
    if (isPersonalized) {
      if (source === 'ai') {
        return "Books tailored to your preferences using AI";
      } else {
        return "Books tailored to your preferences";
      }
    } else {
      return "Popular books our readers love";
    }
  };

  return (
    <Container maxWidth="lg">
      <BookRecommendationCarousel
        title={getTitle()}
        subtitle={getSubtitle()}
        books={books}
        loading={loading}
        error={error}
        onRefresh={handleRefresh}
        isAiPowered={source === 'ai'}
      />
    </Container>
  );
};

export default Recommendations;
