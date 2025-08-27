import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Rating,
  Avatar,
  Divider,
  Card,
  CardContent,
  Grid,
  Skeleton,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import { ThumbUp, ThumbUpOutlined, ChatBubbleOutline, Edit, Delete } from '@mui/icons-material';
import { format } from 'date-fns';
import { Review, getBookReviews, toggleLikeReview } from '../../services/reviewService';
import EditReviewForm from './EditReviewForm';
import DeleteReviewDialog from './DeleteReviewDialog';
import ReviewComments from './ReviewComments';
import UserInfo from '../user/UserInfo';

interface ReviewListProps {
  bookId: string;
  currentUserId?: string; // Optional, for checking if the user can like/edit reviews
  onRefresh?: () => void;
}

const ReviewList: React.FC<ReviewListProps> = ({ bookId, currentUserId, onRefresh }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching reviews for book:', bookId);
        const data = await getBookReviews(bookId);
        console.log('Reviews data received:', data);
        setReviews(data);
      } catch (err: any) {
        console.error('Error fetching reviews:', err);
        const errorMessage = err.message || 'Failed to load reviews';
        setError(`${errorMessage}. Please try again later.`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, [bookId]);
  
  const handleLikeToggle = async (reviewId: string) => {
    if (!currentUserId) {
      // Redirect to login or show login modal
      console.log('User must be logged in to like reviews');
      return;
    }
    
    try {
      const updatedReview = await toggleLikeReview(reviewId);
      
      // Update the review in the state
      setReviews(reviews.map(review => 
        review.id === reviewId ? updatedReview : review
      ));
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };
  
  if (loading) {
    return (
      <Box my={4}>
        {[1, 2, 3].map((item) => (
          <Card key={item} sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Skeleton variant="circular" width={40} height={40} />
                <Box ml={2}>
                  <Skeleton variant="text" width={120} height={24} />
                  <Skeleton variant="text" width={80} height={16} />
                </Box>
              </Box>
              <Skeleton variant="text" width={100} height={24} />
              <Skeleton variant="text" width="100%" height={80} />
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box my={4}>
        <Typography color="error">{error}</Typography>
        <Button 
          variant="outlined" 
          color="primary" 
          sx={{ mt: 2 }}
          onClick={onRefresh}
        >
          Retry
        </Button>
      </Box>
    );
  }
  
  if (reviews.length === 0) {
    return (
      <Box my={4}>
        <Typography variant="body1" color="textSecondary">
          No reviews yet. Be the first to review this book!
        </Typography>
      </Box>
    );
  }
  
  // Handle successful edit
  const handleReviewUpdate = async () => {
    try {
      setLoading(true);
      const data = await getBookReviews(bookId);
      setReviews(data);
    } catch (err) {
      console.error('Error refreshing reviews:', err);
    } finally {
      setLoading(false);
      setEditingReviewId(null);
      setDeletingReviewId(null);
    }
  };

  return (
    <Box my={4}>
      <Typography variant="h6" gutterBottom>
        Reviews ({reviews.length})
      </Typography>
      
      {reviews.map((review) => {
        const isLiked = currentUserId ? review.likes.includes(currentUserId) : false;
        const isAuthor = currentUserId === review.userId;
        
        return (
          <Card key={review.id} sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <UserInfo 
                    userId={review.userId} 
                    avatarSize={40}
                    nameVariant="subtitle2"
                  />
                  <Box ml={2}>
                    <Typography variant="caption" color="textSecondary">
                      {format(new Date(review.createdAt), 'MMM d, yyyy')}
                      {review.createdAt !== review.updatedAt && ' (edited)'}
                    </Typography>
                  </Box>
                </Box>
                
                {isAuthor && (
                  <Box>
                    <IconButton 
                      color="primary" 
                      size="small" 
                      onClick={() => setEditingReviewId(review.id)}
                      aria-label="edit review"
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      size="small"
                      onClick={() => setDeletingReviewId(review.id)}
                      aria-label="delete review"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Box>
              
              <Box my={1}>
                <Rating value={review.rating} precision={1} readOnly />
              </Box>
              
              <Typography variant="body1" paragraph>
                {review.text}
              </Typography>
              
              {review.imageUrls && review.imageUrls.length > 0 && (
                <Grid container spacing={1} sx={{ mt: 2, mb: 2 }}>
                  {review.imageUrls.map((url, index) => (
                    <Grid item xs={4} sm={3} md={2} key={index}>
                      <Box
                        sx={{
                          height: 100,
                          backgroundColor: '#f0f0f0',
                          backgroundImage: `url(${url})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          borderRadius: 1,
                          cursor: 'pointer',
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Tooltip title={currentUserId ? "Like this review" : "Sign in to like reviews"}>
                  <span>
                    <IconButton
                      color={isLiked ? "primary" : "default"}
                      onClick={() => handleLikeToggle(review.id)}
                      disabled={!currentUserId || isAuthor}
                    >
                      {isLiked ? <ThumbUp /> : <ThumbUpOutlined />}
                    </IconButton>
                  </span>
                </Tooltip>
                <Typography variant="body2" color="textSecondary" sx={{ mr: 2 }}>
                  {review.likes.length}
                </Typography>
              </Box>
              
              <ReviewComments 
                review={review} 
                currentUserId={currentUserId} 
                onCommentAdded={(updatedReview) => {
                  setReviews(reviews.map(r => 
                    r.id === updatedReview.id ? updatedReview : r
                  ));
                }} 
              />
            </CardContent>
          </Card>
        );
      })}

      {/* Edit Review Modal */}
      {editingReviewId && (
        <EditReviewForm
          reviewId={editingReviewId}
          open={!!editingReviewId}
          onClose={() => setEditingReviewId(null)}
          onSuccess={handleReviewUpdate}
        />
      )}

      {/* Delete Review Dialog */}
      {deletingReviewId && (
        <DeleteReviewDialog
          reviewId={deletingReviewId}
          open={!!deletingReviewId}
          onClose={() => setDeletingReviewId(null)}
          onSuccess={handleReviewUpdate}
        />
      )}
    </Box>
  );
};

export default ReviewList;
