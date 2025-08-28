import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import {
  Container,
  Grid,
  Box,
  Typography,
  Paper,
  Divider,
  Avatar,
  Button,
  Rating,
  TextField,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Breadcrumbs,
  Link as MuiLink,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  ArrowBack as ArrowBackIcon,
  ThumbUp as ThumbUpIcon,
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  ThumbDown as ThumbDownIcon,
  ThumbDownOutlined as ThumbDownOutlinedIcon,
  ChatBubbleOutline as CommentIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Report as ReportIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';
import ResponsiveImage from '../../components/common/ResponsiveImage';

// Styled components for review detail page
const ReviewHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: theme.spacing(2)
  },
}));

const BookInfoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  }
}));

const UserInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
}));

const VoteButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(0.5, 1.5),
  minWidth: 'auto',
  borderRadius: 20,
}));

const CommentForm = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const CommentItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none'
  }
}));

// Mock data types
interface Review {
  id: string;
  bookId: string;
  bookTitle: string;
  bookCover: string;
  bookAuthor: string;
  userId: string;
  username: string;
  userAvatar?: string;
  rating: number;
  title: string;
  content: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null;
}

interface Comment {
  id: string;
  reviewId: string;
  userId: string;
  username: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

const ReviewDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const { user, isAuthenticated } = useAuth();
  
  // State for review, comments, and form
  const [review, setReview] = useState<Review | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch review and comments data
  useEffect(() => {
    const fetchReviewData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // This would be replaced with actual API calls
        // Mock data for demo purposes
        const mockReview: Review = {
          id: id as string,
          bookId: 'book123',
          bookTitle: 'The Midnight Library',
          bookCover: '/images/books/midnight-library.jpg',
          bookAuthor: 'Matt Haig',
          userId: 'user456',
          username: 'bookworm42',
          userAvatar: '/images/avatars/user1.jpg',
          rating: 4.5,
          title: 'A Journey Through Possibilities',
          content: `
            This book took me on an incredible journey through the concept of parallel lives and the choices we make. 
            Matt Haig has created a beautifully written story about regret, hope, and the infinite possibilities of life.
            
            The main character, Nora Seed, finds herself in a library between life and death, where each book represents a different version of her life based on different choices. It's a thought-provoking exploration of the what-ifs we all contemplate.
            
            The writing style is accessible yet profound, making complex philosophical concepts easy to digest. I found myself highlighting numerous passages that resonated deeply with me.
            
            While the premise might seem fantastical, the emotional core of the story feels authentic and relatable. Anyone who has ever wondered about the roads not taken will find something meaningful in this novel.
            
            My only criticism would be that some of the parallel lives felt a bit rushed, and I would have enjoyed exploring certain scenarios in more depth. Nevertheless, this is a minor complaint in an otherwise exceptional read.
            
            Highly recommended for anyone who enjoys philosophical fiction with heart.
          `.trim(),
          createdAt: '2023-07-15T10:30:00Z',
          upvotes: 42,
          downvotes: 3,
          userVote: user ? 'up' : null,
        };
        
        const mockComments: Comment[] = [
          {
            id: 'comment1',
            reviewId: id as string,
            userId: 'user789',
            username: 'literaryfan',
            userAvatar: '/images/avatars/user2.jpg',
            content: 'I completely agree with your assessment! The concept was brilliant and executed so well. Did you read any of his other books?',
            createdAt: '2023-07-16T14:22:00Z'
          },
          {
            id: 'comment2',
            reviewId: id as string,
            userId: 'user101',
            username: 'readingaddict',
            userAvatar: '/images/avatars/user3.jpg',
            content: 'Great review! I felt the same way about some of the parallel lives being a bit rushed. I wanted to spend more time in certain scenarios.',
            createdAt: '2023-07-17T09:15:00Z'
          },
          {
            id: 'comment3',
            reviewId: id as string,
            userId: 'user456',
            username: 'bookworm42',
            userAvatar: '/images/avatars/user1.jpg',
            content: "Thanks for the comments! @literaryfan - Yes, I've read 'How to Stop Time' as well and loved it. Haig has a way with blending philosophical concepts with engaging storytelling.",
            createdAt: '2023-07-17T16:40:00Z'
          }
        ];
        
        // Simulate API delay
        setTimeout(() => {
          setReview(mockReview);
          setComments(mockComments);
          setLoading(false);
        }, 800);
        
      } catch (err) {
        console.error('Error fetching review data:', err);
        setError('Failed to load review. Please try again later.');
        setLoading(false);
      }
    };

    fetchReviewData();
  }, [id, user]);

  // Handle upvote/downvote
  const handleVote = async (voteType: 'up' | 'down') => {
    if (!isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent(router.asPath));
      return;
    }
    
    if (!review) return;
    
    try {
      // Optimistic update
      const newReview = { ...review };
      
      if (review.userVote === voteType) {
        // Undo vote
        newReview.userVote = null;
        newReview[voteType === 'up' ? 'upvotes' : 'downvotes'] -= 1;
      } else {
        // If changing vote, remove previous vote first
        if (review.userVote) {
          newReview[review.userVote === 'up' ? 'upvotes' : 'downvotes'] -= 1;
        }
        
        // Add new vote
        newReview.userVote = voteType;
        newReview[voteType === 'up' ? 'upvotes' : 'downvotes'] += 1;
      }
      
      setReview(newReview);
      
      // This would be replaced with an actual API call to update votes
      console.log(`Vote ${voteType} for review ${review.id}`);
      
    } catch (err) {
      console.error('Error updating vote:', err);
      // Revert on error
      setError('Failed to update vote. Please try again.');
    }
  };

  // Handle comment submission
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent(router.asPath));
      return;
    }
    
    if (!newComment.trim() || !user || !review) return;
    
    try {
      setSubmitting(true);
      
      // This would be replaced with an actual API call
      // Mock adding a comment
      const newCommentObj: Comment = {
        id: `comment${Date.now()}`,
        reviewId: review.id,
        userId: user.id,
        username: user.username,
        userAvatar: user.avatarUrl,
        content: newComment,
        createdAt: new Date().toISOString()
      };
      
      // Simulate API delay
      setTimeout(() => {
        setComments([...comments, newCommentObj]);
        setNewComment('');
        setSubmitting(false);
      }, 500);
      
    } catch (err) {
      console.error('Error submitting comment:', err);
      setError('Failed to submit comment. Please try again.');
      setSubmitting(false);
    }
  };

  // Check if current user is review author
  const isAuthor = user && review && user.id === review.userId;

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  if (!review) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 4 }}>Review not found</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <>
      <Head>
        <title>{review.title} | Review | BookReview</title>
        <meta name="description" content={`Review of ${review.bookTitle} by ${review.username}`} />
      </Head>

      <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
        {/* Back button and breadcrumbs */}
        <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => router.back()}
            size={isMobile ? "small" : "medium"}
          >
            Back
          </Button>
          
          <Breadcrumbs aria-label="breadcrumb" sx={{ flexGrow: 1 }}>
            <Link href="/" passHref>
              <MuiLink underline="hover" color="inherit">
                Home
              </MuiLink>
            </Link>
            <Link href="/books" passHref>
              <MuiLink underline="hover" color="inherit">
                Books
              </MuiLink>
            </Link>
            <Link href={`/books/${review.bookId}`} passHref>
              <MuiLink underline="hover" color="inherit">
                {review.bookTitle}
              </MuiLink>
            </Link>
            <Typography color="text.primary">Review</Typography>
          </Breadcrumbs>
        </Box>

        <Paper elevation={2} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2, mb: 4 }}>
          {/* Book and review info header */}
          <ReviewHeader>
            <BookInfoContainer>
              {/* Book cover */}
              <Box sx={{ minWidth: isMobile ? '100%' : 120, textAlign: isMobile ? 'center' : 'left' }}>
                <Box 
                  sx={{ 
                    maxWidth: isMobile ? 150 : 120,
                    mx: isMobile ? 'auto' : 0
                  }}
                >
                  <ResponsiveImage
                    src={review.bookCover}
                    alt={review.bookTitle}
                    aspectRatio="2/3"
                    rounded
                  />
                </Box>
              </Box>

              {/* Book info */}
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="h6" 
                  component="h2"
                  gutterBottom
                >
                  <Link href={`/books/${review.bookId}`} passHref style={{ textDecoration: 'none', color: 'inherit' }}>
                    {review.bookTitle}
                  </Link>
                </Typography>
                <Typography 
                  variant="subtitle1" 
                  color="text.secondary" 
                  gutterBottom
                >
                  by {review.bookAuthor}
                </Typography>
              </Box>
            </BookInfoContainer>

            {/* Action buttons for author */}
            {isAuthor && (
              <Box sx={{ display: 'flex', gap: 1, ml: 'auto', mt: { xs: 0, sm: 1 } }}>
                <Button 
                  startIcon={<EditIcon />}
                  variant="outlined"
                  size="small"
                  onClick={() => router.push(`/reviews/edit/${review.id}`)}
                >
                  Edit
                </Button>
                <Button 
                  startIcon={<DeleteIcon />}
                  variant="outlined"
                  color="error"
                  size="small"
                >
                  Delete
                </Button>
              </Box>
            )}
          </ReviewHeader>

          <Divider sx={{ mb: 3 }} />

          {/* Review content */}
          <Box sx={{ mb: 4 }}>
            {/* Review title and rating */}
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="h5" 
                component="h1" 
                gutterBottom
                sx={{ 
                  fontWeight: 600,
                  fontSize: { xs: '1.5rem', md: '1.8rem' }
                }}
              >
                {review.title}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Rating value={review.rating} precision={0.5} readOnly />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  {review.rating.toFixed(1)}
                </Typography>
              </Box>
            </Box>

            {/* Author info */}
            <UserInfo>
              <Avatar 
                src={review.userAvatar} 
                alt={review.username}
                sx={{ width: 36, height: 36 }}
              />
              <Box>
                <Typography variant="subtitle2">
                  <Link href={`/profile/${review.userId}`} passHref style={{ textDecoration: 'none', color: 'inherit' }}>
                    {review.username}
                  </Link>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                </Typography>
              </Box>
            </UserInfo>

            {/* Review text */}
            <Typography 
              variant="body1" 
              component="div" 
              sx={{ 
                mt: 2, 
                lineHeight: 1.8,
                whiteSpace: 'pre-line'
              }}
            >
              {review.content}
            </Typography>

            {/* Voting and actions */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                mt: 4,
                flexWrap: 'wrap',
                gap: 2
              }}
            >
              {/* Voting buttons */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <VoteButton
                  variant={review.userVote === 'up' ? 'contained' : 'outlined'}
                  color="primary"
                  size="small"
                  startIcon={review.userVote === 'up' ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
                  onClick={() => handleVote('up')}
                >
                  {review.upvotes}
                </VoteButton>
                
                <VoteButton
                  variant={review.userVote === 'down' ? 'contained' : 'outlined'}
                  color="error"
                  size="small"
                  startIcon={review.userVote === 'down' ? <ThumbDownIcon /> : <ThumbDownOutlinedIcon />}
                  onClick={() => handleVote('down')}
                >
                  {review.downvotes}
                </VoteButton>
              </Box>
              
              {/* Report button */}
              <Box>
                <Button
                  startIcon={<ReportIcon />}
                  color="inherit"
                  size="small"
                  sx={{ color: 'text.secondary' }}
                >
                  Report
                </Button>
              </Box>
            </Box>
          </Box>

          <Divider />

          {/* Comments section */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CommentIcon fontSize="small" />
              Comments ({comments.length})
            </Typography>

            {/* Comment form */}
            <CommentForm component="form" onSubmit={handleSubmitComment}>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder={isAuthenticated ? "Add a comment..." : "Login to leave a comment"}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={!isAuthenticated || submitting}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={!isAuthenticated || !newComment.trim() || submitting}
                >
                  {submitting ? 'Posting...' : 'Post Comment'}
                </Button>
              </Box>
            </CommentForm>

            {/* Comments list */}
            <List sx={{ bgcolor: 'background.paper' }}>
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <CommentItem key={comment.id} alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar 
                        src={comment.userAvatar} 
                        alt={comment.username}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                          <Box>
                            <Typography variant="subtitle2" component="span">
                              <Link href={`/profile/${comment.userId}`} passHref style={{ textDecoration: 'none', color: 'inherit' }}>
                                {comment.username}
                              </Link>
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </Typography>
                          </Box>
                          {user?.id === comment.userId && (
                            <Box>
                              <IconButton size="small">
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" color="error">
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          color="text.primary"
                          sx={{ mt: 1 }}
                        >
                          {comment.content}
                        </Typography>
                      }
                    />
                  </CommentItem>
                ))
              ) : (
                <Box sx={{ py: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No comments yet. Be the first to comment!
                  </Typography>
                </Box>
              )}
            </List>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default ReviewDetailPage;
