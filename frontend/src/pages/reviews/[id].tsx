import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  CircularProgress, 
  Avatar, 
  Card,
  CardContent,
  Rating,
  Divider,
  Button,
  IconButton,
  Chip,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Head from 'next/head';
import Layout from '../../components/layout/Layout';
import PageHeader from '../../components/navigation/PageHeader';
import { useRouter } from 'next/router';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import BookIcon from '@mui/icons-material/Book';
import PersonIcon from '@mui/icons-material/Person';
import { formatDistanceToNow } from 'date-fns';
import ResponsiveImage from '../../components/common/ResponsiveImage';

// Mock data for a single review
const MOCK_REVIEW = {
  id: '1',
  userId: 'user1',
  username: 'Sarah Johnson',
  userAvatar: '',
  rating: 4.5,
  title: 'Engaging and Well-Written',
  content: `This book kept me engaged from beginning to end. The character development was exceptional and the plot had unexpected twists that kept me turning pages well into the night.

The author has a talent for creating vivid scenes that transport the reader directly into the story. I particularly enjoyed the way the protagonist evolved throughout the narrative, showing genuine growth and complexity.

While the middle section had a slightly slower pace, it served to build tension for an explosive and satisfying conclusion. The themes of redemption and forgiveness were handled with nuance and emotional intelligence.

Overall, this is a must-read for fans of the genre, and I'll definitely be looking for more books by this author.`,
  date: '2025-08-01T14:30:00',
  bookTitle: 'The Silent Echo',
  bookId: 'book1',
  bookCover: 'https://placeholder.pics/svg/300x400/ED4264/FFFFFF/Book%20Cover',
  bookAuthor: 'Michelle Spencer',
  upvotes: 42,
  downvotes: 3,
  tags: ['Fiction', 'Mystery'],
  helpful: true,
  comments: [
    {
      id: 'comment1',
      userId: 'user2',
      username: 'Michael Chen',
      content: 'I completely agree with your assessment of the character development. It was one of the strongest aspects of the book!',
      date: '2025-08-02T09:45:00',
    },
    {
      id: 'comment2',
      userId: 'user3',
      username: 'Emily Rodriguez',
      content: 'Did you find the middle section too slow? I thought it helped build the atmosphere.',
      date: '2025-08-03T16:30:00',
    }
  ]
};

const ReviewContent = styled(Typography)(({ theme }) => ({
  whiteSpace: 'pre-line',
  marginBottom: theme.spacing(3),
  lineHeight: 1.7,
}));

const VoteContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginTop: theme.spacing(1),
}));

const BookInfoCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  height: '100%',
  [theme.breakpoints.up('md')]: {
    textAlign: 'left',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
}));

const ReviewDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [review, setReview] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load review data
  useEffect(() => {
    if (!id) return;

    // Simulate API call
    setTimeout(() => {
      setReview(MOCK_REVIEW);
      setLoading(false);
    }, 800);
  }, [id]);

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  // Handle voting
  const handleUpvote = () => {
    setReview((prev: any) => ({
      ...prev,
      upvotes: prev.upvotes + 1,
      helpful: true
    }));
  };

  const handleDownvote = () => {
    setReview((prev: any) => ({
      ...prev,
      downvotes: prev.downvotes + 1,
      helpful: false
    }));
  };

  if (loading) {
    return (
      <Layout>
        <Container>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        </Container>
      </Layout>
    );
  }

  if (error || !review) {
    return (
      <Layout>
        <Container>
          <Alert severity="error" sx={{ my: 2 }}>
            {error || 'Review not found.'}
          </Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            variant="outlined"
          >
            Go Back
          </Button>
        </Container>
      </Layout>
    );
  }

  const formattedDate = formatDistanceToNow(new Date(review.date), { addSuffix: true });

  return (
    <Layout>
      <Head>
        <title>{`${review.title} - Review by ${review.username} | BookReview`}</title>
        <meta name="description" content={`Read ${review.username}'s review of ${review.bookTitle}`} />
      </Head>

      <Container>
        <PageHeader
          title={review.title}
          breadcrumbs={[
            { label: 'Reviews', href: '/reviews' },
            { label: review.title, href: `/reviews/${review.id}` },
          ]}
          actions={[
            {
              label: 'Back to Reviews',
              onClick: handleBack,
              icon: <ArrowBackIcon />,
              variant: 'outlined',
            },
          ]}
        />

        <Grid container spacing={4}>
          {/* Main review content */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                {/* Review header */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    src={review.userAvatar} 
                    alt={review.username}
                    sx={{ width: 48, height: 48, mr: 2 }}
                  >
                    {review.username?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{review.username}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formattedDate}
                    </Typography>
                  </Box>
                  <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                    <Rating value={review.rating} precision={0.5} readOnly />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {review.rating}
                    </Typography>
                  </Box>
                </Box>

                {/* Tags */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                  {review.tags.map((tag: string, index: number) => (
                    <Chip 
                      key={index} 
                      label={tag} 
                      size="small" 
                      color="primary"
                      variant="outlined" 
                    />
                  ))}
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Review content */}
                <ReviewContent variant="body1">
                  {review.content}
                </ReviewContent>

                {/* Voting section */}
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">
                    Was this review helpful?
                  </Typography>
                  <VoteContainer>
                    <IconButton
                      color={review.helpful === true ? "primary" : "default"}
                      onClick={handleUpvote}
                    >
                      <ThumbUpIcon />
                    </IconButton>
                    <Typography variant="body2" sx={{ mx: 1 }}>
                      {review.upvotes}
                    </Typography>
                    <IconButton
                      color={review.helpful === false ? "error" : "default"}
                      onClick={handleDownvote}
                    >
                      <ThumbDownIcon />
                    </IconButton>
                    <Typography variant="body2" sx={{ mx: 1 }}>
                      {review.downvotes}
                    </Typography>
                  </VoteContainer>
                </Box>
              </CardContent>
            </Card>

            {/* Comments section */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Comments ({review.comments.length})
              </Typography>
              <List>
                {review.comments.map((comment: any) => (
                  <ListItem
                    key={comment.id}
                    alignItems="flex-start"
                    sx={{
                      bgcolor: 'background.paper',
                      mb: 1,
                      borderRadius: 1,
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar>
                        {comment.username.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="subtitle2">
                            {comment.username}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDistanceToNow(new Date(comment.date), { addSuffix: true })}
                          </Typography>
                        </Box>
                      }
                      secondary={comment.content}
                    />
                  </ListItem>
                ))}
              </List>

              {/* Add comment button */}
              <Button 
                variant="outlined" 
                fullWidth 
                sx={{ mt: 2 }}
              >
                Add a Comment
              </Button>
            </Box>
          </Grid>

          {/* Sidebar with book info */}
          <Grid item xs={12} md={4}>
            <BookInfoCard elevation={1}>
              <Box sx={{ 
                width: { xs: '100%', sm: '150px', md: '120px' },
                mb: { xs: 2, md: 0 },
                mr: { md: 2 },
                display: 'flex',
                justifyContent: 'center',
              }}>
                <Box sx={{ width: '100%', maxWidth: '150px' }}>
                  <ResponsiveImage
                    src={review.bookCover}
                    alt={review.bookTitle}
                    aspectRatio="60%"
                    sizes="150px"
                  />
                </Box>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {review.bookTitle}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  by {review.bookAuthor}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<BookIcon />}
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => router.push(`/books/${review.bookId}`)}
                >
                  View Book
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PersonIcon />}
                  fullWidth
                  sx={{ mt: 1 }}
                  onClick={() => router.push(`/profile/${review.userId}`)}
                >
                  View Reviewer Profile
                </Button>
              </Box>
            </BookInfoCard>

            <Paper sx={{ p: 2, mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                More reviews for this book
              </Typography>
              <Button 
                variant="text" 
                color="primary" 
                sx={{ mt: 1 }}
                fullWidth
                onClick={() => router.push(`/books/${review.bookId}?tab=reviews`)}
              >
                See all reviews
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
};

export default ReviewDetailPage;
