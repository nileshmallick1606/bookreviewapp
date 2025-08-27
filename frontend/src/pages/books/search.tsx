import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { 
  Container, 
  Typography, 
  Grid, 
  Box, 
  CircularProgress, 
  Divider,
  Chip,
  Alert
} from '@mui/material';
import BookCard from '../../components/books/BookCard';
import BookSearch from '../../components/books/BookSearch';
import { BookService, Book } from '../../services/bookService';

/**
 * Book search results page
 */
const SearchResults: NextPage = () => {
  const router = useRouter();
  const { q } = router.query;
  const query = q as string;

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only search when the query parameter is available and not empty
    if (query && query.trim() !== '') {
      const searchBooks = async () => {
        try {
          setLoading(true);
          setError(null);
          const data = await BookService.searchBooks(query);
          setBooks(data);
        } catch (err) {
          setError('Failed to load search results. Please try again later.');
          console.error('Error searching books:', err);
        } finally {
          setLoading(false);
        }
      };

      searchBooks();
    } else if (router.isReady && !query) {
      // If the route is ready but no query is provided
      setLoading(false);
      setBooks([]);
    }
  }, [query, router.isReady]);

  return (
    <>
      <Head>
        <title>{query ? `Search: ${query}` : 'Book Search'} | BookReview</title>
        <meta name="description" content="Search for books by title or author" />
      </Head>
      
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Search bar */}
        <Box sx={{ mb: 4 }}>
          <BookSearch />
        </Box>
        
        <Divider sx={{ mb: 4 }} />

        {/* Search results */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={60} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        ) : (
          <>
            {/* Search info */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                Search Results
              </Typography>
              {query && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body1" color="text.secondary" mr={1}>
                    Showing results for:
                  </Typography>
                  <Chip label={query} color="primary" variant="outlined" />
                </Box>
              )}
              <Typography variant="body1" color="text.secondary">
                Found {books.length} {books.length === 1 ? 'result' : 'results'}
              </Typography>
            </Box>

            {/* Results grid */}
            {books.length > 0 ? (
              <Grid container spacing={3}>
                {books.map(book => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
                    <BookCard book={book} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" gutterBottom>
                  No books found.
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Try a different search term or browse all books.
                </Typography>
              </Box>
            )}
          </>
        )}
      </Container>
    </>
  );
};

export default SearchResults;
