import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { 
  Container, 
  Grid, 
  Box, 
  Typography, 
  Rating, 
  Chip, 
  Button,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link as MuiLink
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ShareIcon from '@mui/icons-material/Share';
import Link from 'next/link';
import { BookService, Book } from '../../services/bookService';

const BookDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await BookService.getBookById(id as string);
        setBook(data);
      } catch (err) {
        setError('Failed to load book details. Please try again later.');
        console.error('Error fetching book details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBookDetails();
    }
  }, [id]);

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error || !book) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error || 'Book not found.'}
        </Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
          variant="outlined"
        >
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <>
      <Head>
        <title>{`${book.title} by ${book.author} | BookReview`}</title>
        <meta name="description" content={`Read reviews and ratings for ${book.title} by ${book.author}`} />
      </Head>
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Breadcrumbs navigation */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link href="/" passHref>
            <MuiLink underline="hover" color="inherit">Home</MuiLink>
          </Link>
          <Link href="/books" passHref>
            <MuiLink underline="hover" color="inherit">Books</MuiLink>
          </Link>
          <Typography color="text.primary">{book.title}</Typography>
        </Breadcrumbs>

        {/* Back button */}
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
          variant="text"
          sx={{ mb: 3 }}
        >
          Back to Books
        </Button>

        {/* Book details */}
        <Grid container spacing={4}>
          {/* Left column: Cover image */}
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 2, 
                height: 'fit-content',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <Box 
                component="img"
                src={book.coverImage || '/images/book-placeholder.jpg'}
                alt={book.title}
                sx={{ 
                  width: '100%',
                  maxWidth: 300,
                  height: 'auto',
                  objectFit: 'contain',
                  mb: 2
                }}
              />
              
              {/* Action buttons */}
              <Box sx={{ width: '100%', mt: 2, display: 'flex', gap: 1 }}>
                <Button 
                  variant="outlined" 
                  startIcon={<BookmarkBorderIcon />}
                  fullWidth
                >
                  Save
                </Button>
                <Button 
                  variant="outlined"
                  startIcon={<ShareIcon />}
                  fullWidth
                >
                  Share
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Right column: Book info */}
          <Grid item xs={12} md={8}>
            <Typography variant="h4" component="h1" gutterBottom>
              {book.title}
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              by {book.author}
            </Typography>
            
            {/* Rating display */}
            {book.averageRating !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Rating 
                  value={book.averageRating} 
                  precision={0.1} 
                  readOnly 
                />
                <Typography variant="body1" ml={1} color="text.secondary">
                  {book.averageRating.toFixed(1)}
                  {book.reviewCount !== undefined && ` • ${book.reviewCount} reviews`}
                </Typography>
              </Box>
            )}
            
            {/* Genres */}
            <Box sx={{ mb: 3, mt: 2 }}>
              {book.genres?.map((genre, index) => (
                <Chip 
                  key={index}
                  label={genre}
                  variant="outlined"
                  sx={{ mr: 0.5, mb: 0.5 }}
                />
              ))}
            </Box>

            <Divider sx={{ my: 3 }} />
            
            {/* Book description */}
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" paragraph>
              {book.description || 'No description available.'}
            </Typography>
            
            {/* Book metadata */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Published Year
                  </Typography>
                  <Typography variant="body1">
                    {book.publishedYear}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Book ID
                  </Typography>
                  <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                    {book.id}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />
            
            {/* Reviews section placeholder */}
            <Typography variant="h6" gutterBottom>
              Reviews
            </Typography>
            <Paper elevation={0} variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1">
                This book has no reviews yet. Be the first to add one!
              </Typography>
              <Button 
                variant="contained" 
                color="primary"
                sx={{ mt: 2 }}
                disabled
              >
                Write a Review (Coming Soon)
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default BookDetailPage;
