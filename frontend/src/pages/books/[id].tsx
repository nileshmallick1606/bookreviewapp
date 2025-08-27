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
  Link as MuiLink,
  Tooltip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ShareIcon from '@mui/icons-material/Share';
import Link from 'next/link';
import { BookService, Book } from '../../services/bookService';
import ReviewForm from '../../components/reviews/ReviewForm';
import ReviewList from '../../components/reviews/ReviewList';
import { useAppSelector } from '../../hooks/reduxHooks';

const BookDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewListKey, setReviewListKey] = useState(0); // Add a key to force refresh the review list
  
  // Get auth state from Redux
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

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
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {book.averageRating ? (
                <>
                  <Rating 
                    value={book.averageRating} 
                    precision={0.1} 
                    readOnly 
                  />
                  <Typography variant="body1" ml={1} color="text.secondary">
                    {book.averageRating.toFixed(1)}
                    {book.totalReviews !== undefined && book.totalReviews > 0 && 
                      ` • ${book.totalReviews} review${book.totalReviews > 1 ? 's' : ''}`}
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No ratings yet
                </Typography>
              )}
            </Box>
            
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
            
            {/* Reviews section */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Reviews
              </Typography>
              
              {isAuthenticated ? (
                <Tooltip title="You can submit multiple reviews for this book to share different perspectives or update your thoughts over time">
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    endIcon={showReviewForm ? <span>▲</span> : <span>▼</span>}
                    size="small"
                  >
                    {showReviewForm ? 'Hide Review Form' : 'Add Another Review'}
                  </Button>
                </Tooltip>
              ) : (
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => router.push(`/auth/login?redirect=${encodeURIComponent(`/books/${book.id}`)}`)}
                  size="small"
                >
                  Login to Write a Review
                </Button>
              )}
            </Box>
            
            {/* Review Form */}
            {isAuthenticated && (
              <Box 
                mb={4} 
                sx={{ 
                  maxHeight: showReviewForm ? '2000px' : '0',
                  overflow: 'hidden',
                  transition: 'all 0.5s ease',
                  opacity: showReviewForm ? 1 : 0,
                  mb: showReviewForm ? 4 : 0
                }}
              >
                <Box sx={{ 
                  p: showReviewForm ? 2 : 0, 
                  border: '1px solid #e0e0e0', 
                  borderRadius: 1,
                }}>
                  <ReviewForm 
                    bookId={book.id} 
                    onSuccess={() => {
                      setShowReviewForm(false);
                      // Reload book details to update rating
                      BookService.getBookById(book.id).then(updatedBook => setBook(updatedBook));
                      // Force refresh of review list
                      setReviewListKey(prev => prev + 1);
                    }} 
                  />
                </Box>
              </Box>
            )}
            
            {/* Review List */}
            <Box sx={{ mt: 3 }}>
              <ReviewList 
                key={reviewListKey} // Add key to force refresh when a new review is added
                bookId={book.id}
                currentUserId={user?.id}
                onRefresh={() => {
                  // Reload book details to update rating and review count
                  BookService.getBookById(book.id)
                    .then(updatedBook => {
                      console.log('Updated book data:', updatedBook);
                      setBook(updatedBook);
                      // Also refresh the review list
                      setReviewListKey(prev => prev + 1);
                    })
                    .catch(err => console.error('Error refreshing book details:', err));
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default BookDetailPage;
