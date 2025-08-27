import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Grid,
  CircularProgress,
  Alert,
  Container
} from '@mui/material';
import { BookService, Book } from '../../services/bookService';
import BookCard from '../books/BookCard';

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
        const topRatedBooks = await BookService.getTopRatedBooks(6);
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (books.length === 0) {
    return null; // Don't show the section if there are no top-rated books
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        Top Rated Books
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Discover the highest-rated books in our collection
      </Typography>
      
      <Grid container spacing={3}>
        {books.map(book => (
          <Grid item xs={12} sm={6} md={4} key={book.id}>
            <BookCard book={book} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default TopRatedBooks;
