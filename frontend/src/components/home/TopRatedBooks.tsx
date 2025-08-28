import React, { useState, useEffect } from 'react';
import { 
  Box,
  CircularProgress,
  Alert,
  Container
} from '@mui/material';
import { BookService, Book } from '../../services/bookService';
import BookRecommendationCarousel from '../recommendations/BookRecommendationCarousel';

/**
 * Component to display top-rated books
 */
const TopRatedBooks: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopRatedBooks = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch more books for the horizontal carousel
        const topRatedBooks = await BookService.getTopRatedBooks(12);
        setBooks(topRatedBooks);
      } catch (err) {
        console.error('Error fetching top-rated books:', err);
        setError('Failed to load top-rated books. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTopRatedBooks();
  }, []);

  return (
    <Container maxWidth="lg">
      <BookRecommendationCarousel 
        title="Top Rated Books"
        subtitle="Discover the highest-rated books in our collection"
        books={books}
        loading={loading}
        error={error}
      />
    </Container>
  );
};

export default TopRatedBooks;
